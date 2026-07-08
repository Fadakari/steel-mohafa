// server/api/articles/index.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineCachedEventHandler(async () => {
  return await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      metaDescription: true,
      imageUrl: true,
      publishedAt: true
    }
  })
}, {
  // کش کردن برای یک سال (تا زمانی که وب‌هوک آن را پاک کند)
  maxAge: 60 * 60 * 24 * 365,
  swr: false,
  name: 'articles-cache'
})