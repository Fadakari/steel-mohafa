export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  console.log('🚀 سیگنال وب‌هوک دریافت شد. در حال بازرسی کش نیترو...');

  try {
    const storage = useStorage('cache');
    // گرفتن لیست تمام کلیدها برای دیباگ
    const keys = await storage.getKeys();
    console.log('🔑 تمام کلیدهای موجود در حافظه کش:', keys);

    let purgedCount = 0;

    for (const key of keys) {
      // این چک کردن را وسیع‌تر کردیم تا اگر پیشوندی داشتند باز هم حذف شوند
      if (
        key.includes('globals') || 
        key.includes('homepage') || 
        key.includes('articles') ||
        key.includes('products') ||
        key.includes('categories')
      ) {
        console.log(`🧹 حذف کلید: ${key}`);
        await storage.removeItem(key);
        purgedCount++;
      }
    }

    console.log(`✅ پاکسازی تمام شد. تعداد حذف شده: ${purgedCount}`);

    return { 
      success: true, 
      message: 'پاکسازی انجام شد.',
      purgedKeysCount: purgedCount,
      debugKeys: keys // این لیست را در مرورگر هم می‌بینید که کمک می‌کند
    }
  } catch (error) {
    console.error('❌ خطا:', error);
    return { success: false, error: 'Purge failed' };
  }
})