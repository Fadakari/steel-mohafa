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

  // استفاده از آرایه AND برای جلوگیری از اوررایت شدن شرط‌های کوئری پریسما
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

    // --- سیستم هوشمند جبران دیتای ایمپورت شده ---
    // اگر در زیردسته هستیم، بگرد و محصولات مرتبطِ دسته مادر را هم بیاور
    if (targetCategory?.parentId) {
      const nameParts = targetCategory.name.trim().split(' ')
      const mainKeyword = nameParts[nameParts.length - 1] // استخراج کلمه کلیدی (مثلاً 310s)

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

  // پاک کردن آرایه اگر خالی بود تا پریسما ارور ندهد
  if (whereClause.AND.length === 0) {
    delete whereClause.AND
  }

  try {
    const rawProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true, slug: true } }
      },
      orderBy: { updatedAt: 'desc' }
    })

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
        return activeAttributeFilters.every(filter => {
          const productAttrValue = pAttr[filter.key]
          return productAttrValue && filter.values.includes(productAttrValue)
        })
      })
    }

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
    const query = getQuery(event)
    return JSON.stringify(query) || 'default'
  }
})