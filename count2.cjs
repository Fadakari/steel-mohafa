const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const cat = await prisma.categories.findFirst({
    where: { slug: 'ورق-استیل-304' }
  })
  if (cat) {
    const count = await prisma.products.count({
      where: { category_id: cat.id }
    })
    console.log('ورق-استیل-304 ID:', cat.id, 'Count:', count)
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
