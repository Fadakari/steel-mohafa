import { PrismaClient } from '@prisma/client'
import { extractAttributesFromName } from '../../utils/attributeExtractor'

const prisma = new PrismaClient()

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const { search, categorySlug, minPrice, maxPrice } = query

  // ساختار شرط‌های پویا برای فیلترینگ
  const whereClause: any = {}

  // ۱. فیلتر جستجوی متنی (نام محصول یا SKU)
  if (search) {
    whereClause.OR = [
      { name: { contains: String(search) } },
      { sku: { contains: String(search) } }
    ]
  }

  // ۲. فیلتر بر اساس دسته‌بندی یا زیردسته‌ها (بر اساس Slug برای سئو)
  if (categorySlug) {
    whereClause.category = {
      slug: String(categorySlug)
    }
  }

  // ۳. فیلتر محدوده قیمت
  if (minPrice || maxPrice) {
    whereClause.price = {
      ...(minPrice && { gte: Number(minPrice) }),
      ...(maxPrice && { lte: Number(maxPrice) })
    }
  }

  // --- قطعه کد جدیدی که باید اضافه کنی ---
  // ۴. فیلتر داینامیک بر اساس ویژگی‌های JSON (مثل ضخامت، آلیاژ و...)
  const ignoredKeys = ['categorySlug', 'search', 'minPrice', 'maxPrice']
  const attributeConditions: any[] = []

  for (const [key, value] of Object.entries(query)) {
    if (!ignoredKeys.includes(key) && value) {
      const valuesArray = String(value).split(',')
      
      // ساخت شرط OR برای مقادیر مختلف یک ویژگی (مثلاً اگر کاربر هم ضخامت ۲ و هم ۳ را تیک زده بود)
      const orConditions = valuesArray.map(val => ({
        attributes: { 
          path: [key], 
          equals: val 
        }
      }))
      
      attributeConditions.push({ OR: orConditions })
    }
  }

  if (attributeConditions.length > 0) {
    whereClause.AND = attributeConditions
  }

  try {
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // محاسبه درصد تغییرات قیمت در سمت سرور برای کاهش پردازش فرانت‌ایند
    const availableFilters: Record<string, Set<string>> = {}

    const mappedProducts = products.map(product => {
      // --- منطق Fallback هوشمند شما ---
      let productAttributes = product.attributes as Record<string, string>
      
      // اگر ویژگی‌ها در دیتابیس null بود یا کلیدی نداشت، همان لحظه از نام استخراج کن
      if (!productAttributes || Object.keys(productAttributes).length === 0) {
        productAttributes = extractAttributesFromName(product.name)
      }

      // پر کردن لیست فیلترهای داینامیک برای سایدبار UI
      for (const [key, value] of Object.entries(productAttributes)) {
        if (!availableFilters[key]) availableFilters[key] = new Set()
        if (value) availableFilters[key].add(value)
      }

      // --- محاسبه منطق صعود/نزول قیمت (کدهای قبلی) ---
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
        attributes: productAttributes, // ارسال ویژگی‌های نهایی به فرانت
        metaTitle: product.metaTitle || product.name,
      }
    })

    // تبدیل Set به Array برای ارسال تمیز JSON به فرانت‌ایند
    const dynamicFilters = Object.fromEntries(
      Object.entries(availableFilters).map(([key, value]) => [key, Array.from(value)])
    )

    // تغییر ساختار return برای ارسال هم‌زمان محصولات و فیلترها
    return {
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
  maxAge: 60 * 60, // دیتا تا ۱ ساعت در کش می‌ماند
  swr: true, // اگر دیتا منقضی شد، همان دیتای قبلی را سریع نشان بده و در پس‌زمینه کش را آپدیت کن
  name: 'products-list', // نام گروه کش
  getKey: (event) => {
    // کلید کش بر اساس URL و فیلترها ساخته می‌شود تا هر فیلتر کش اختصاصی خودش را داشته باشد
    const url = getRequestURL(event)
    return url.search || 'default'
  }
})