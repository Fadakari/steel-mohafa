import { PrismaClient } from '@prisma/client'
import { extractAttributesFromName } from '../../utils/attributeExtractor'

const prisma = new PrismaClient()

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  // جدا کردن فیلترهای داینامیک از پارامترهای اصلی
  const { search, categorySlug, minPrice, maxPrice, ...dynamicFiltersQuery } = query

  let targetCategory = null
  const categoryIds: number[] = []

  // ۱. پیدا کردن هوشمند دسته‌بندی و زیردسته‌های آن
  if (categorySlug) {
    targetCategory = await prisma.category.findUnique({
      where: { slug: String(categorySlug) },
      include: { children: true }
    })

    // اضافه کردن آیدی دسته فعلی و تمام زیردسته‌های آن برای کوئری
    if (targetCategory) {
      categoryIds.push(targetCategory.id)
      targetCategory.children.forEach(child => categoryIds.push(child.id))
    }
  }

  const whereClause: any = {}

  if (search) {
    whereClause.OR = [
      { name: { contains: String(search) } },
      { sku: { contains: String(search) } }
    ]
  }

  // گرفتن محصولات دسته مادر و زیردسته‌ها
  if (categoryIds.length > 0) {
    whereClause.categoryId = { in: categoryIds }
  } else if (categorySlug && !targetCategory) {
    // اگر دسته‌بندی در دیتابیس یافت نشد
    whereClause.id = -1 
  }

  if (minPrice || maxPrice) {
    whereClause.price = {
      ...(minPrice && { gte: Number(minPrice) }),
      ...(maxPrice && { lte: Number(maxPrice) })
    }
  }

  try {
    // ۲. دریافت محصولات از دیتابیس بدون درگیری با محدودیت JSON در MySQL
    const rawProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true, slug: true } }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // ۳. اعمال فیلترهای داینامیک در لایه سرور (بسیار سریع و بدون ارور ۵۰۰)
    let filteredProducts = rawProducts
    const activeAttributeFilters = Object.entries(dynamicFiltersQuery)
      .filter(([key, val]) => val !== undefined && val !== '')
      .map(([key, val]) => ({ key, values: String(val).split(',') }))

    if (activeAttributeFilters.length > 0) {
      filteredProducts = rawProducts.filter(product => {
        let pAttr = (product.attributes as Record<string, string>) || {}
        if (Object.keys(pAttr).length === 0) {
          pAttr = extractAttributesFromName(product.name)
        }
        // بررسی اینکه محصول شرایط همه فیلترهای انتخابی کاربر را دارد
        return activeAttributeFilters.every(filter => {
          const productAttrValue = pAttr[filter.key]
          return productAttrValue && filter.values.includes(productAttrValue)
        })
      })
    }

    // ۴. ساخت خروجی نهایی محصولات و فیلترهای موجود
    const availableFilters: Record<string, Set<string>> = {}
    const mappedProducts = filteredProducts.map(product => {
      let productAttributes = (product.attributes as Record<string, string>) || {}
      
      if (Object.keys(productAttributes).length === 0) {
        productAttributes = extractAttributesFromName(product.name)
      }

      for (const [key, value] of Object.entries(productAttributes)) {
        if (!availableFilters[key]) availableFilters[key] = new Set()
        if (value) availableFilters[key].add(value)
      }

      let priceDiffPercentage = 0
      let trend: 'up' | 'down' | 'stable' = 'stable'

      if (product.previousPrice && product.previousPrice !== 0) {
        const diff = product.price - product.previousPrice
        priceDiffPercentage = Math.round((diff / product.previousPrice) * 100)
        trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable'
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        trend,
        priceDiffPercentage: Math.abs(priceDiffPercentage),
        attributes: productAttributes,
        metaTitle: product.metaTitle || product.name,
      }
    })

    const dynamicFilters = Object.fromEntries(
      Object.entries(availableFilters).map(([key, value]) => [key, Array.from(value)])
    )

    // اضافه شدن دیتای دسته‌بندی برای هدر فرانت‌ایند
    return {
      categoryName: targetCategory ? targetCategory.name : null,
      categoryMetaTitle: targetCategory ? targetCategory.name : null,
      products: mappedProducts,
      filters: dynamicFilters
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در دریافت لیست محصولات صنعتی.'
    })
  }
}, {
  maxAge: 60 * 60,
  swr: true,
  name: 'products-list',
  getKey: (event) => {
    const url = getRequestURL(event)
    return decodeURIComponent(url.search) || 'default'
  }
})