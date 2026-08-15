import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to generate slugs
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const categoriesData = [
  {
    title: 'ورق استیل (Sheets & Plates)',
    slug: 'ورق-استیل',
    children: [
      '304 / 304L',
      '316 / 316L',
      '321',
      '310 / 310S',
      '309 / 309S',
      '430',
      '420',
      '410',
      '201',
      'Decorative (طلایی، میرور، خشدار، رنگی)',
    ],
  },
  {
    title: 'پروفیل استیل (Profiles & Box Sections)',
    slug: 'پروفیل-استیل',
    children: ['201', '304', '316', 'Decorative'],
  },
  {
    title: 'لوله استیل (Pipes & Tubes)',
    slug: 'لوله-استیل',
    children: ['201', '304', '316 / 316L', '321', '310 / 310S', 'Food-grade (صنایع غذایی)'],
  },
  {
    title: 'میلگرد استیل (Round Bars)',
    slug: 'میلگرد-استیل',
    children: ['304', '316 / 316L', '321', '310 / 310S', '420', '430', '410'],
  },
  {
    title: 'مقاطع پایه (Base Sections)',
    slug: 'مقاطع-پایه',
    children: [
      'Flat Bars 304 (تسمه ۳۰۴)',
      'Flat Bars 316 (تسمه ۳۱۶)',
      'Angles 304 (نبشی ۳۰۴)',
      'Angles 316 (نبشی ۳۱۶)',
      'Channels 304 (ناودانی ۳۰۴)',
      'Channels 316 (ناودانی ۳۱۶)',
      'Hex/Square Bars (چهارپهلو و ششپهلو)',
    ],
  },
  {
    title: 'اتصالات استیل (Fittings)',
    slug: 'اتصالات-استیل',
    children: [
      'Welded (جوشی)',
      'Threaded (دنده‌ای)',
      'Food-grade (صنایع غذایی)',
      'Flanges (فلنج)',
    ],
  },
  {
    title: 'شیرآلات استیل (Valves)',
    slug: 'شیرآلات-استیل',
    children: ['Industrial (صنعتی)', 'Food-grade (صنایع غذایی)'],
  },
  {
    title: 'مفتول و سیم جوش (Wire & Welding)',
    slug: 'مفتول-و-سیم-جوش',
    children: [
      'Wire 201 (مفتول ۲۰۱)',
      'Wire 304 (مفتول ۳۰۴)',
      'Wire 316 (مفتول ۳۱۶)',
      'Welding Wires & Electrodes (سیم جوش، الکترود و فیلر)',
    ],
  },
]

async function main() {
  console.log('🌱 Starting category seeding...')

  for (const parent of categoriesData) {
    // 1. Create Parent Category
    const createdParent = await prisma.categories.create({
      data: {
        title: parent.title,
        slug: parent.slug,
        SEO_meta: JSON.stringify({ description: `خرید و قیمت روز ${parent.title}` })
      },
    })
    console.log(`✅ Parent Created: ${createdParent.title}`)

    // 2. Create Children Categories
    for (const childTitle of parent.children) {
      const childSlug = `${parent.slug}-${slugify(childTitle)}`
      
      await prisma.categories.create({
        data: {
          title: childTitle,
          slug: childSlug,
          parent_id: createdParent.id,
          SEO_meta: JSON.stringify({ description: `خرید و استعلام قیمت ${childTitle} از دسته ${parent.title}` })
        },
      })
      console.log(`  ↳ Child Created: ${childTitle}`)
    }
  }

  console.log('🎉 All categories seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
