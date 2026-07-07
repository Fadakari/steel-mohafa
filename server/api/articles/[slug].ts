// server/api/articles/[slug].ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // این خط اسلاگ را از آدرس API استخراج می‌کند
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) return null

  return await prisma.article.findUnique({
    where: { slug: decodeURIComponent(slug) }
  })
})