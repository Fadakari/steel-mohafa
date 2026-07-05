// مسیر: server/api/sync-attributes.ts
import { PrismaClient } from '@prisma/client'
import { extractAttributesFromName } from '../utils/attributeExtractor'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // گرفتن تمام محصولاتی که هنوز attributes ندارند یا می‌خواهیم بازنویسی کنیم
  const products = await prisma.product.findMany({
    select: { id: true, name: true }
  })

  let updatedCount = 0

  for (const product of products) {
    const extractedData = extractAttributesFromName(product.name)

    // اگر دیتایی استخراج شد، محصول را آپدیت می‌کنیم
    if (Object.keys(extractedData).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: { attributes: extractedData }
      })
      updatedCount++
    }
  }

  return { 
    message: 'ویژگی‌های محصولات با موفقیت استخراج و در دیتابیس ثبت شد.',
    totalProducts: products.length,
    updatedCount 
  }
})