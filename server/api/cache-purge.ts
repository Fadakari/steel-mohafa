// server/api/cache-purge.ts

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  
  // برای امنیت بیشتر، می‌توانید یک توکن در هدر یا بادی چک کنید، اما فعلا برای لوکال ساده پیش می‌رویم
  try {
    const storage = useStorage('nitro:handlers')
    const keys = await storage.getKeys()

    // پیدا کردن و حذف تمام فایل‌های کش مربوط به هندلرهایی که تعریف کرده‌ایم
    for (const key of keys) {
      if (key.includes('globals-cache') || key.includes('homepage-cache') || key.includes('articles-cache') || key.includes('products-cache') || key.includes('header-categories-cache')) {
        await storage.removeItem(key)
      }
    }

    return { 
      success: true, 
      message: 'تمامی کش‌های متصل به دایرکتوس با موفقیت پاکسازی شدند و در درخواست بعدی بازسازی می‌شوند.',
      collectionUpdated: body?.collection || 'unknown'
    }
  } catch (error) {
    console.error('خطا در پاکسازی کش نیترو:', error)
    return { success: false, error: 'Purge failed' }
  }
})