import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineCachedEventHandler(async () => {
  const [settings, sections, latestArticles] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.homepageSection.findMany({ where: { isActive: true } }),
    prisma.article.findMany({ take: 3, orderBy: { publishedAt: 'desc' } })
  ])

  return {
    settings: Object.fromEntries(settings.map(s => [s.key, s.value])),
    sections,
    latestArticles
  }
}, { maxAge: 3600, swr: false })