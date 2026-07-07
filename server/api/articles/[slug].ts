import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const rawSlug = getRouterParam(event, 'slug')
  
  if (!rawSlug) {
    throw createError({ statusCode: 400, statusMessage: 'اسلاگ نامعتبر است' })
  }

  // ایجاد فرمت‌های مختلف از اسلاگ برای جستجوی قطعی در دیتابیس (فارسی، کدگذاری‌شده، و حروف کوچک)
  const decodedSlug = decodeURIComponent(rawSlug)
  const encodedSlug = encodeURIComponent(decodedSlug).toLowerCase()

  const article = await prisma.article.findFirst({
    where: {
      OR: [
        { slug: rawSlug },
        { slug: decodedSlug },
        { slug: encodedSlug },
        // وردپرس گاهی فاصله ها را با %20 و گاهی با - ذخیره میکند
        { slug: encodedSlug.replace(/%20/g, '-') } 
      ]
    }
  })

  // اگر پیدا نشد، به جای خروجی خالی (null)، ارور 404 برمی‌گردانیم تا دیباگ راحت باشد
  if (!article) {
    throw createError({ statusCode: 404, statusMessage: 'مقاله در دیتابیس یافت نشد!' })
  }

  return article
})