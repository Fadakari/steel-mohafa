import { PrismaClient } from '@prisma/client'
import { extractAttributesFromName } from '../../utils/attributeExtractor'

const prisma = new PrismaClient()

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const { search, categorySlug, minPrice, maxPrice, ...dynamicFiltersQuery } = query

  let targetCategory = null
  const categoryIds: number[] = []

  if (categorySlug) {
    targetCategory = await prisma.category.findUnique({
      where: { slug: String(categorySlug) },
      include: { children: true }
    })

    if (targetCategory) {
      categoryIds.push(targetCategory.id)
      targetCategory.children.forEach(child => categoryIds.push(child.id))
    }
  }

  const whereClause: any = { AND: [] }

  if (search) {
    whereClause.AND.push({
      OR: [
        { name: { contains: String(search) } },
        { sku: { contains: String(search) } }
      ]
    })
  }

  if (categoryIds.length > 0) {
    const categoryConditions: any[] = [
      { categoryId: { in: categoryIds } }
    ]

    if (targetCategory?.parentId) {
      const nameParts = targetCategory.name.trim().split(' ')
      const mainKeyword = nameParts[nameParts.length - 1]

      categoryConditions.push({
        categoryId: targetCategory.parentId,
        name: { contains: mainKeyword }
      })
    }

    whereClause.AND.push({ OR: categoryConditions })
  } else if (categorySlug && !targetCategory) {
    whereClause.AND.push({ id: -1 })
  }

  if (minPrice || maxPrice) {
    const priceCondition: any = {}
    if (minPrice) priceCondition.gte = Number(minPrice)
    if (maxPrice) priceCondition.lte = Number(maxPrice)
    whereClause.AND.push({ price: priceCondition })
  }

  if (whereClause.AND.length === 0) {
    delete whereClause.AND
  }

  try {
    // ۱. دریافت تمام محصولات خام این دسته‌بندی (بدون اعمال فیلترهای ویژگی)
    const rawProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true, slug: true } }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // آماده‌سازی فیلترهای ویژگی که کاربر انتخاب کرده است
    const activeAttributeFilters = Object.entries(dynamicFiltersQuery)
      .filter(([key, val]) => val !== undefined && val !== '')
      .map(([key, val]) => ({ key, values: String(val).split(',') }))

    // ۲. فیلتر کردن نهایی محصولات برای نمایش در لیست (اِعمال همه فیلترها)
    let filteredProducts = rawProducts
    if (activeAttributeFilters.length > 0) {
      filteredProducts = rawProducts.filter(product => {
        let pAttr = (product.attributes as Record<string, string>) || {}
        if (Object.keys(pAttr).length === 0) pAttr = extractAttributesFromName(product.name)
        
        return activeAttributeFilters.every(filter => {
          const productAttrValue = pAttr[filter.key]
          return productAttrValue && filter.values.includes(productAttrValue)
        })
      })
    }

    // ۳. سیستم هوشمند ساخت گزینه‌های سایدبار (حل مشکل محو شدن گزینه‌ها)
    const availableFilters: Record<string, Set<string>> = {}
    
    // الف) پیدا کردن تمام کلیدهای ویژگی موجود در این دسته‌بندی (مثلاً آلیاژ، ابعاد، ضخامت)
    const allPossibleKeys = new Set<string>()
    rawProducts.forEach(product => {
      let pAttr = (product.attributes as Record<string, string>) || {}
      if (Object.keys(pAttr).length === 0) pAttr = extractAttributesFromName(product.name)
      Object.keys(pAttr).forEach(key => allPossibleKeys.add(key))
    })

    // ب) محاسبه گزینه‌های مجاز برای هر ویژگی به صورت کاملاً مستقل
    allPossibleKeys.forEach(filterKey => {
      availableFilters[filterKey] = new Set()

      // جادوی کار اینجاست: برای ساختن گزینه‌های یک ویژگی، فیلترِ خود آن ویژگی را نادیده می‌گیریم!
      const otherActiveFilters = activeAttributeFilters.filter(f => f.key !== filterKey)

      const validProductsForThisKey = rawProducts.filter(product => {
        let pAttr = (product.attributes as Record<string, string>) || {}
        if (Object.keys(pAttr).length === 0) pAttr = extractAttributesFromName(product.name)
        
        // بررسی می‌کنیم که آیا این محصول شرایط بقیه فیلترها را دارد یا نه
        return otherActiveFilters.every(filter => {
          const productAttrValue = pAttr[filter.key]
          return productAttrValue && filter.values.includes(productAttrValue)
        })
      })

      // مقادیر مجاز را از محصولاتی که از فیلترهای دیگر جان سالم به در برده‌اند استخراج می‌کنیم
      validProductsForThisKey.forEach(product => {
        let pAttr = (product.attributes as Record<string, string>) || {}
        if (Object.keys(pAttr).length === 0) pAttr = extractAttributesFromName(product.name)
        
        if (pAttr[filterKey]) {
          availableFilters[filterKey].add(pAttr[filterKey])
        }
      })
    })

    // ۴. ساختاردهی دیتای محصولات برای ارسال به فرانت‌ایند
    const mappedProducts = filteredProducts.map(product => {
      let productAttributes = (product.attributes as Record<string, string>) || {}
      if (Object.keys(productAttributes).length === 0) {
        productAttributes = extractAttributesFromName(product.name)
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
  // تنظیمات لایه حافظه موقت (کش ابدی تا زمان لغو با وب‌هوک)
  maxAge: 60, // هر ۶۰ ثانیه کش را اعتبار سنجی می‌کند (نه در هر بار لود)
  swr: true,  // دیتای قدیمی را نشان بده اما در پس‌زمینه تازه کن
  name: 'products-cache',
  getKey: (event) => {
    const url = event.node.req.url || ''
    return 'products:' + url
  }
})