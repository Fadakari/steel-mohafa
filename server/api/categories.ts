import { prisma } from '../utils/prisma'

export default defineEventHandler(async () => {
  try {
    const allCategories = await prisma.categories.findMany({
      where: {
        // فیلتر کردن دسته بندی‌های نامعتبر
        title: { notIn: ['بدون دسته بندی', 'بدون دسته‌بندی', 'Uncategorized'] }
      },
      include: { other_categories: true },
      orderBy: { id: 'asc' }
    })

    const parentCategories = allCategories.filter(cat => !cat.parent_id)

    // Map the fields to match the old format expected by SiteHeader.vue
    const mappedCategories = parentCategories.map(cat => ({
      id: cat.id,
      name: cat.title,
      slug: cat.slug,
      children: cat.other_categories ? cat.other_categories.map((child: any) => ({
        id: child.id,
        name: child.title,
        slug: child.slug
      })) : []
    }))

    return mappedCategories.length > 0 ? mappedCategories : []
  } catch (error) {
    console.error('خطا در دریافت دسته‌بندی‌های هدر:', error)
    return []
  }
})