import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('شروع خواندن فایل وردپرس و استخراج هوشمند دسته‌بندی‌ها...');
  const results: any[] = [];

  // ۱. خواندن تمام فایل CSV و ذخیره در حافظه
  await new Promise((resolve, reject) => {
    fs.createReadStream('products.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`تعداد ${results.length} محصول برای پردازش پیدا شد.`);

  // مرحله ۱: پردازش و ساخت دسته‌بندی‌های تو در تو
  const categoryMap = new Map<string, number>();

  for (const row of results) {
    const categoriesString = row['دسته‌ها'] || 'بدون دسته‌بندی';
    // برخی محصولات چند دسته‌بندی دارند که با کاما جدا شده
    const paths = categoriesString.split(',');

    for (const path of paths) {
      // جدا کردن دسته‌های مادر و فرزند با علامت >
      const parts = path.split('>').map((p: string) => p.trim());
      let parentId: number | null = null;

      for (const part of parts) {
        if (!part) continue;
        
        if (!categoryMap.has(part)) {
          // ساخت اسلاگ تمیز (فاصله‌ها تبدیل به خط تیره می‌شوند)
          const cleanSlug = part.replace(/\s+/g, '-');
          
          // اگر دسته وجود نداشت، آن را در دیتابیس می‌سازیم
          const newCat = await prisma.category.upsert({
            where: { slug: cleanSlug },
            update: {}, // اگر بود کاری نکن
            create: {
              name: part,
              slug: cleanSlug,
              parentId: parentId, // اتصال به دسته بالاسری
            },
          });
          categoryMap.set(part, newCat.id);
        }
        // شناسه این دسته می‌شود مادر برای زیردسته بعدی در حلقه
        parentId = categoryMap.get(part)!;
      }
    }
  }

  console.log('✅ ساختار تو در توی دسته‌بندی‌ها با موفقیت حفظ و ساخته شد!');

  // مرحله ۲: انتقال محصولات
  console.log('در حال وارد کردن محصولات (لطفا چند ثانیه صبر کنید)...');
  
  for (const row of results) {
    const productName = row['نام']?.trim();
    if (!productName) continue;

    // استخراج قیمت (اول قیمت ویژه، اگه نبود قیمت عادی)
    const priceStr = row['قیمت فروش ویژه'] || row['قیمت عادی'] || '0';
    const price = parseFloat(priceStr.replace(/,/g, '')); // حذف کاما از قیمت‌های میلیونی

    // پیدا کردن آخرین سطح دسته‌بندی برای این محصول (Leaf Category)
    const paths = (row['دسته‌ها'] || 'بدون دسته‌بندی').split(',');
    const firstPath = paths[0].split('>').map((p: string) => p.trim());
    const leafCategory = firstPath[firstPath.length - 1];
    const categoryId = categoryMap.get(leafCategory);

    const productSlug = productName.replace(/\s+/g, '-');

    try {
      await prisma.product.upsert({
        where: { slug: productSlug },
        update: {
          price: price,
        },
        create: {
          name: productName,
          slug: productSlug,
          price: price,
          sku: row['شناسه محصول'] || null,
          categoryId: categoryId || 1, 
          metaDescription: row['توضیح کوتاه'] || '',
          imageUrl: row['تصاویر']?.split(',')[0]?.trim() || null, // گرفتن اولین عکس محصول
        },
      });
    } catch (error) {
      console.log(`خطا در ثبت محصول: ${productName} (رد شد)`);
    }
  }

  console.log('🎉 انتقال تمام اطلاعات با موفقیت به پایان رسید!');
  await prisma.$disconnect();
}

migrateData();