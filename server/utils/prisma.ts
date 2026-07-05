// وارد کردن کل پکیج به عنوان یک متغیر دیفالت
import Prisma from '@prisma/client'

// استخراج PrismaClient از داخل آن (دقیقاً همان چیزی که ارور از ما خواست)
const { PrismaClient } = Prisma

const prismaGlobal = globalThis as unknown as {
  prisma: typeof PrismaClient.prototype | undefined
}

export const prisma = prismaGlobal.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prisma
}