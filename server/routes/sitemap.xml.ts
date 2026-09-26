import { defineEventHandler } from 'h3'
import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  // Fetch dynamic categories
  const categories = await prisma.categories.findMany({
    include: {
      categories: true // This gets the parent category relation based on prisma schema (categories_parent_id_foreign)
    }
  })

  // Fetch dynamic blogs
  // Wait, let's look at the article schema: slug, publishedAt
  const articles = await prisma.article.findMany({
    select: {
      slug: true,
      publishedAt: true
    }
  })

  // Static URLs
  const staticUrls = [
    '/',
    '/about',
    '/contact',
    '/calculator',
    '/blog'
  ]

  // Construct XML
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  const baseUrl = 'https://mohafa.com'
  const today = new Date().toISOString()

  // Add static URLs
  for (const url of staticUrls) {
    sitemap += `  <url>\n`
    sitemap += `    <loc>${baseUrl}${url}</loc>\n`
    sitemap += `    <lastmod>${today}</lastmod>\n`
    sitemap += `    <changefreq>daily</changefreq>\n`
    sitemap += `    <priority>${url === '/' ? '1.0' : '0.8'}</priority>\n`
    sitemap += `  </url>\n`
  }

  // Add Categories
  for (const cat of categories) {
    if (!cat.slug) continue
    
    // Construct path: if it has a parent, /category/parentSlug/childSlug, else /category/childSlug
    let path = ''
    if (cat.categories && cat.categories.slug) {
      path = `/category/${cat.categories.slug}/${cat.slug}`
    } else {
      path = `/category/${cat.slug}`
    }
    
    // We encode URI to handle Persian slugs if needed, though most browsers handle it, sitemaps should have URL encoded strings
    const encodedPath = encodeURI(path)

    sitemap += `  <url>\n`
    sitemap += `    <loc>${baseUrl}${encodedPath}</loc>\n`
    sitemap += `    <lastmod>${today}</lastmod>\n`
    sitemap += `    <changefreq>daily</changefreq>\n`
    sitemap += `    <priority>0.9</priority>\n`
    sitemap += `  </url>\n`
  }

  // Add Articles
  for (const article of articles) {
    if (!article.slug) continue
    
    const encodedPath = encodeURI(`/blog/${article.slug}`)
    const lastmod = article.publishedAt ? new Date(article.publishedAt).toISOString() : today

    sitemap += `  <url>\n`
    sitemap += `    <loc>${baseUrl}${encodedPath}</loc>\n`
    sitemap += `    <lastmod>${lastmod}</lastmod>\n`
    sitemap += `    <changefreq>weekly</changefreq>\n`
    sitemap += `    <priority>0.7</priority>\n`
    sitemap += `  </url>\n`
  }

  sitemap += '</urlset>'

  // Set the correct Content-Type for XML
  setHeader(event, 'content-type', 'application/xml')
  
  return sitemap
})
