import codecs

# 1. Update API
api_content = '''import { prisma } from '../../../utils/prisma'

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
    const historyData: any[] = await prisma.$queryRaw`
      SELECT id, price, unit, is_call_for_price, date_created 
      FROM price_history 
      WHERE product_id = ${productId} 
      ORDER BY date_created DESC, id DESC 
      LIMIT 50
    `

    const processedHistory = historyData.map((current, index) => {
      const previous = historyData[index + 1]
      
      const currentPrice = Number(current.price)
      const oldPrice = previous ? Number(previous.price) : null
      
      let changePercent = 0
      if (oldPrice && oldPrice > 0) {
        changePercent = Number(((currentPrice - oldPrice) / oldPrice * 100).toFixed(2))
      }

      return {
        id: current.id.toString(),
        date: current.date_created,
        jalaliDate: new Date(current.date_created).toLocaleDateString('fa-IR', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        price: currentPrice,
        old_price: oldPrice,
        change_percent: changePercent,
        reason: 'نوسانات بازار',
        is_call_for_price: current.is_call_for_price
      }
    })

    return processedHistory
  } catch (error) {
    console.error('Price History Error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch price history' })
  }
})
'''

with codecs.open('server/api/products/[id]/price-history.ts', 'w', 'utf-8') as f:
    f.write(api_content)


# 2. Update Vue component
content = codecs.open('app/components/PricingTable.vue', 'r', 'utf-8').read()

import re

content = re.sub(
    r'\{\{\s*point\.source\s*===\s*\'mysql_trigger_auto\'\s*\?\s*\'[^\']+\'\s*:\s*\'[^\']+\'\s*\}\}', 
    '{{ point.reason || \\\'نوسانات بازار\\\' }}', 
    content
)

content = content.replace('point.change > 0', 'point.change_percent > 0')
content = content.replace('point.change < 0', 'point.change_percent < 0')
content = content.replace('point.change === 0', 'point.change_percent === 0')
content = content.replace('{{ point.changePercentage }}%', '{{ point.change_percent }}%')


with codecs.open('app/components/PricingTable.vue', 'w', 'utf-8') as f:
    f.write(content)

print("Updates applied")
