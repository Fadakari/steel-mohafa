import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  try {
    const bestSellers = await prisma.product.findMany({
      where: { is_best_seller: true },
      take: 3,
      orderBy: { updatedAt: 'desc' }
    })

    return bestSellers.map(product => {
      // محاسبه روند قیمت (مشابه منطقی که قبلا داشتید)
      let priceDiffPercentage = 0
      let trend: 'up' | 'down' | 'stable' = 'stable'
      
      if (product.previousPrice && product.previousPrice !== 0) {
        const diff = product.price - product.previousPrice
        priceDiffPercentage = Math.round((diff / product.previousPrice) * 100)
        trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable'
      }

      return {
        ...product,
        trend,
        priceDiffPercentage: Math.abs(priceDiffPercentage)
      }
    })
  } catch (error) {
    return []
  }
})