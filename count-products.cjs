const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.products.count({
    where: {
      category_id: 11 // Or whichever category is 'ورق-استیل-304'
    }
  })
  console.log('Count:', count)
  
  const allCount = await prisma.products.count()
  console.log('All products:', allCount)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
