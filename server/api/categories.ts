import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineCachedEventHandler(async () => {
  try {
    const allCategories = await prisma.category.findMany({
      where: {
        // این خطوط "بدون دسته بندی" یا "Uncategorized" را فیلتر می‌کنند
        name: { notIn: ['بدون دسته بندی', 'بدون دسته‌بندی', 'Uncategorized'] }
      },
      include: { children: true },
      orderBy: { id: 'asc' }
    })

    const parentCategories = allCategories.filter(cat => !cat.parentId)

    return parentCategories.length > 0 ? parentCategories : allCategories
  } catch (error) {
    console.error('خطا در دریافت دسته‌بندی‌های هدر:', error)
    return []
  }
}, {
  maxAge: 60 * 60 * 24 * 365,
  swr: false,
  name: 'header-categories-cache'
})