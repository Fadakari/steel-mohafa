// مسیر فایل: scripts/import-wp.ts
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { XMLParser } from 'fast-xml-parser'

const prisma = new PrismaClient()

// تابع کمکی برای استخراج متن خالص از HTML (برای ساخت متا دسکریپشن خودکار)
const stripHtml = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '').replace(/[\r\n\t]+/g, ' ').trim()
}

async function importWordPressPosts() {
  console.log('🚀 در حال شروع عملیات مهاجرت مقالات از وردپرس...')

  // ۱. خواندن فایل XML (نام فایل را دقیقاً همان چیزی که در روت پروژه گذاشتید بنویسید)
  const xmlFilePath = path.join(process.cwd(), 'WordPress.2026-07-07.xml')
  
  if (!fs.existsSync(xmlFilePath)) {
    console.error('❌ فایل XML وردپرس پیدا نشد! مطمئن شوید در مسیر اصلی پروژه قرار دارد.')
    process.exit(1)
  }

  const xmlData = fs.readFileSync(xmlFilePath, 'utf8')

  // ۲. تنظیمات پارسر برای خواندن متادیتاها و تگ‌های تودرتوی وردپرس
  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata', // برای خواندن محتوای پست‌ها که داخل CDATA هستند
    parseTagValue: true,
  })

  console.log('⏳ در حال پردازش فایل XML...')
  const result = parser.parse(xmlData)
  
  const items = result?.rss?.channel?.item
  if (!items || !Array.isArray(items)) {
    console.error('❌ ساختار فایل XML معتبر نیست یا مقاله‌ای یافت نشد.')
    process.exit(1)
  }

  // ۳. جداسازی عکس‌ها (Attachments) از مقالات (Posts)
  // در وردپرس، عکس‌های شاخص خودشان یک Item مجزا در XML هستند!
  const posts = items.filter(item => item['wp:post_type'] === 'post' && item['wp:status'] === 'publish')
  const attachments = items.filter(item => item['wp:post_type'] === 'attachment')

  // ساخت یک دیکشنری برای جستجوی سریع عکس شاخص (ID به URL)
  const attachmentMap: Record<number, string> = {}
  attachments.forEach(att => {
    const id = Number(att['wp:post_id'])
    const url = att['wp:attachment_url'] || (att['__cdata'] ? att['__cdata'] : '')
    if (id && url) attachmentMap[id] = url
  })

  let successCount = 0

  // ۴. حلقه اصلی برای ذخیره در دیتابیس
  for (const post of posts) {
    try {
      // الف) استخراج اطلاعات پایه
      const title = post.title?.['__cdata'] || post.title || 'بدون عنوان'
      const content = post['content:encoded']?.['__cdata'] || post['content:encoded'] || ''
      const publishedAt = new Date(post['wp:post_date'])
      
      // رمزگشایی اسلاگ فارسی (جلوگیری از ذخیره شدن کاراکترهای عجیب %D8%A7 در دیتابیس)
      let slug = post['wp:post_name'] || ''
      try { slug = decodeURIComponent(slug) } catch (e) { /* اگر از قبل دیکود شده بود */ }
      if (!slug) slug = title.replace(/\s+/g, '-').toLowerCase() // Fallback

      // ب) مهندسی استخراج متا دیتا (Post Meta)
      let metaDescription = ''
      let featuredImageUrl = ''

      // بررسی اینکه آیا متادیتاها آرایه هستند یا یک آبجکت تکی
      const postMeta = Array.isArray(post['wp:postmeta']) ? post['wp:postmeta'] : [post['wp:postmeta']]
      
      for (const meta of postMeta) {
        if (!meta) continue
        
        // پیدا کردن آیدی عکس شاخص
        if (meta['wp:meta_key'] === '_thumbnail_id') {
          const thumbnailId = Number(meta['wp:meta_value'])
          if (attachmentMap[thumbnailId]) {
            featuredImageUrl = attachmentMap[thumbnailId]
          }
        }

        // پیدا کردن متا دسکریپشن نوشته شده توسط افزونه‌های سئو (Yoast / RankMath)
        if (meta['wp:meta_key'] === '_yoast_wpseo_metadesc' || meta['wp:meta_key'] === 'rank_math_description') {
          metaDescription = meta['wp:meta_value']?.['__cdata'] || meta['wp:meta_value'] || ''
        }
      }

      // اگر سئوکار متا دسکریپشن ننوشته بود، ۱۵۰ کاراکتر اول محتوا را استخراج کن (تضمین سئو)
      if (!metaDescription) {
        metaDescription = stripHtml(content).substring(0, 150) + '...'
      }

      // ۵. ذخیره امن در دیتابیس (Upsert)
      await prisma.article.upsert({
        where: { slug: slug },
        update: {
          title,
          content,
          metaDescription,
          imageUrl: featuredImageUrl || null,
          publishedAt,
        },
        create: {
          title,
          slug,
          content,
          metaDescription,
          imageUrl: featuredImageUrl || null,
          publishedAt,
        }
      })

      successCount++
      console.log(`✅ مقاله ایمپورت/آپدیت شد: ${title}`)

    } catch (err) {
      console.error(`⚠️ خطا در ایمپورت مقاله:`, err)
    }
  }

  console.log(`\n🎉 عملیات با موفقیت پایان یافت! ${successCount} مقاله با بالاترین کیفیت سئو وارد دیتابیس شد.`)
  await prisma.$disconnect()
}

importWordPressPosts()