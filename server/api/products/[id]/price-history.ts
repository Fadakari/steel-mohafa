import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'no-store, no-cache, must-revalidate, max-age=0')
  setHeader(event, 'pragma', 'no-cache')
  setHeader(event, 'expires', '0')
  removeResponseHeader(event, 'ETag')
  removeResponseHeader(event, 'Last-Modified')

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
  }
  const productId = parseInt(id)

  try {
    // 1. Fetch Legacy Price History (L2)
    const legacyHistory: any[] = await prisma.$queryRaw`
      SELECT id, price, unit, is_call_for_price, date_created 
      FROM price_history 
      WHERE product_id = ${productId} 
      ORDER BY date_created DESC 
      LIMIT 50
    `

    const engineHistory: any[] = await prisma.$queryRaw`
      SELECT id, old_price_per_kg, new_price_per_kg, change_percentage, source, pricing_rule_snapshot, base_alloy_price_used, created_at 
      FROM engine_price_history 
      WHERE product_id = ${productId} 
      ORDER BY created_at DESC 
      LIMIT 50
    `

    // 3. Merge them based on date / price
    const mergedHistory = legacyHistory.map(legacy => {
      // Find matching engine record.
      const matchedEngine = engineHistory.find(eng => 
        Math.round(eng.new_price_per_kg) === Math.round(legacy.price) &&
        Math.abs(new Date(eng.created_at).getTime() - new Date(legacy.date_created).getTime()) < 120000 // Within 2 minutes
      )

      return {
        id: legacy.id.toString(),
        date: legacy.date_created,
        jalaliDate: new Date(legacy.date_created).toLocaleDateString('fa-IR', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        price: Number(legacy.price),
        old_price: matchedEngine ? Number(matchedEngine.old_price_per_kg) : null,
        change_percent: matchedEngine ? Number(matchedEngine.change_percentage) : null,
        reason: matchedEngine ? 'به‌روزرسانی سیستمی بر اساس قیمت جهانی آلیاژ' : 'بروزرسانی دستی توسط کارشناس فروش',
        source: matchedEngine ? matchedEngine.source : 'legacy',
        is_call_for_price: legacy.is_call_for_price
      }
    })

    return mergedHistory
  } catch (error) {
    console.error('Price History Error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch price history' })
  }
})
