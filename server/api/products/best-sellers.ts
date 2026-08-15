import { prisma } from '../../utils/prisma'

export default defineCachedEventHandler(async () => {
  try {
    const bestSellers = await prisma.products.findMany({
      where: {
        is_active: true,
      },
      take: 3,
      include: {
        categories: true,
        price_history: {
          take: 2,
          orderBy: { date_created: 'desc' }
        }
      }
    })

    return bestSellers.map(product => {
      let priceDiffPercentage = 0
      let trend: 'up' | 'down' | 'stable' = 'stable'
      
      const currentPriceObj = product.price_history?.[0]
      const previousPriceObj = product.price_history?.[1]

      const currentPrice = currentPriceObj?.price || 0
      const previousPrice = previousPriceObj?.price || 0

      if (previousPrice && previousPrice !== 0 && currentPrice) {
        const diff = currentPrice - previousPrice
        priceDiffPercentage = Math.round((diff / previousPrice) * 100)
        trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable'
      }

      // Generate a display name based on specs
      const categoryTitle = product.categories?.title || ''
      const parts = [categoryTitle]
      if (product.thickness) parts.push(`ضخامت ${product.thickness}`)
      if (product.dimensions) parts.push(`ابعاد ${product.dimensions}`)
      if (product.outer_diameter) parts.push(`قطر ${product.outer_diameter}`)
      const name = parts.join(' - ')

      return {
        id: product.id,
        name: name,
        price: currentPrice,
        trend,
        priceDiffPercentage: Math.abs(priceDiffPercentage)
      }
    })
  } catch (error) {
    console.error('Error fetching best sellers:', error)
    return []
  }
}, {
  maxAge: 300, // 5 minutes
  name: 'best-sellers-api',
  getKey: () => 'all',
  swr: true,
})