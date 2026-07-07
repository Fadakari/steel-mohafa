import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { XMLParser } from 'fast-xml-parser'

const prisma = new PrismaClient()

// تابع کمکی برای بیرون کشیدن مقدار از داخل آبجکت‌های پارسر XML
const getVal = (field: any) => {
  if (!field) return null
  if (typeof field === 'object' && '__cdata' in field) return field.__cdata
  return field
}

// تابع برای تمیز کردن HTML (برای متادیسکریپشن)
const stripHtml = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '').replace(/[\r\n\t]+/g, ' ').trim()
}

async function importWordPressPosts() {
  console.log('🚀 در حال شروع عملیات مهاجرت مقالات از وردپرس...')

  const xmlFilePath = path.join(process.cwd(), 'WordPress.2026-07-07.xml')
  const xmlData = fs.readFileSync(xmlFilePath, 'utf8')

  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata',
    parseTagValue: true,
  })

  const result = parser.parse(xmlData)
  const items = result?.rss?.channel?.item
  
  if (!items || !Array.isArray(items)) {
    console.error('❌ فایل XML معتبر نیست!')
    process.exit(1)
  }

  // فیلتر کردن مقالات (با تابع getVal ایمن کردیم)
  const posts = items.filter(item => getVal(item['wp:post_type']) === 'post' && getVal(item['wp:status']) === 'publish')
  const attachments = items.filter(item => getVal(item['wp:post_type']) === 'attachment')

  console.log(`📊 تعداد مقالات قابل ایمپورت: ${posts.length}`)

  const attachmentMap: Record<number, string> = {}
  attachments.forEach(att => {
    const id = Number(getVal(att['wp:post_id']))
    const url = getVal(att['wp:attachment_url'])
    if (id && url) attachmentMap[id] = url
  })

  let successCount = 0

  for (const post of posts) {
    try {
      const title = getVal(post.title) || 'بدون عنوان'
      const content = getVal(post['content:encoded']) || ''
      const publishedAt = new Date(getVal(post['wp:post_date']))
      let slug = getVal(post['wp:post_name']) || title.replace(/\s+/g, '-').toLowerCase()

      // استخراج متادیتاها
      let metaDescription = ''
      let featuredImageUrl = ''
      
      const postMeta = Array.isArray(post['wp:postmeta']) ? post['wp:postmeta'] : [post['wp:postmeta']]
      
      for (const meta of postMeta) {
        if (!meta) continue
        const key = getVal(meta['wp:meta_key'])
        const value = getVal(meta['wp:meta_value'])

        if (key === '_thumbnail_id' && attachmentMap[Number(value)]) {
          featuredImageUrl = attachmentMap[Number(value)]
        }
        if ((key === '_yoast_wpseo_metadesc' || key === 'rank_math_description') && value) {
          metaDescription = value
        }
      }

      if (!metaDescription) metaDescription = stripHtml(content).substring(0, 150) + '...'

      await prisma.article.upsert({
        where: { slug: String(slug) },
        update: { title, content, metaDescription, imageUrl: featuredImageUrl || null, publishedAt },
        create: { title, slug: String(slug), content, metaDescription, imageUrl: featuredImageUrl || null, publishedAt }
      })

      successCount++
      console.log(`✅ ${title}`)

    } catch (err) {
      console.error(`⚠️ خطا در مقاله:`, err)
    }
  }

  console.log(`\n🎉 عملیات پایان یافت! ${successCount} مقاله ایمپورت شد.`)
  await prisma.$disconnect()
}

importWordPressPosts()