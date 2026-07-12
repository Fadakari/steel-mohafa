<template>
  <main class="min-h-screen bg-[#050505] text-white pt-28 pb-20 relative overflow-hidden">
    
    <!-- خط نوری تزئینی -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-[#84012B] to-transparent opacity-50"></div>

    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      
      <!-- هدر صفحه -->
      <header class="text-center mb-16 md:mb-20">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold font-mono text-[#ff477e] mb-6 tracking-widest">
          <span class="w-2 h-2 rounded-full bg-[#ff477e] animate-pulse"></span>
          CONTACT US
        </div>
        <h1 class="text-5xl md:text-7xl font-black mb-6 tracking-tighter">ارتباط <span class="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">مستقیم</span></h1>
        <p class="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          برای استعلام قیمتِ لحظه‌ای، هماهنگی جهت بارگیری از انبار و دریافت مشاوره تخصصی متالورژی با دپارتمان فروش ما در تماس باشید.
        </p>
      </header>
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        <!-- بخش اطلاعات تماس (سمت راست در دسکتاپ) -->
        <section class="lg:col-span-5 bg-[#0a0a0c] border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-between">
          <!-- هاله نور پس‌زمینه -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-[#84012B]/20 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div>
            <h2 class="text-2xl font-bold mb-10 border-b border-white/10 pb-4 text-white">راه‌های ارتباطی</h2>
            
            <div class="space-y-8 relative z-10">
              
              <!-- تلفن‌های تماس -->
              <div class="flex items-start gap-5 group">
                <div class="w-12 h-12 shrink-0 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-[#84012B] group-hover:border-[#84012B] transition-all duration-300">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="block text-xs font-mono text-zinc-500 tracking-wider">SALES DEPARTMENT</span>
                  <a href="tel:02166393755" class="text-xl font-black text-white hover:text-[#ff477e] transition-colors" dir="ltr">021 - 6639 3755</a>
                  <a href="tel:02166391417" class="text-xl font-black text-white hover:text-[#ff477e] transition-colors" dir="ltr">021 - 6639 1417</a>
                </div>
              </div>

              <!-- ایمیل -->
              <div class="flex items-start gap-5 group">
                <div class="w-12 h-12 shrink-0 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="block text-xs font-mono text-zinc-500 tracking-wider">EMAIL ADDRESS</span>
                  <a href="mailto:info@mohafa.com" class="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                    info@mohafa.com
                  </a>
                </div>
              </div>

              <!-- آدرس فیزیکی -->
              <div class="flex items-start gap-5 group">
                <div class="w-12 h-12 shrink-0 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all duration-300">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="block text-xs font-mono text-zinc-500 tracking-wider">HEADQUARTERS</span>
                  <address class="text-base text-zinc-300 not-italic leading-relaxed">
                    تهران، بزرگراه فتح، بازار آهن شادآباد، مجتمع تجاری پاییزان، بلوک ۲، پلاک ۱۸
                  </address>
                </div>
              </div>

              <!-- ساعت کاری -->
              <div class="flex items-start gap-5 group">
                <div class="w-12 h-12 shrink-0 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-300">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="block text-xs font-mono text-zinc-500 tracking-wider">BUSINESS HOURS</span>
                  <p class="text-sm text-zinc-300 leading-relaxed">
                    شنبه تا چهارشنبه: <span class="font-bold text-white">۰۸:۳۰ تا ۱۷:۰۰</span><br>
                    پنج‌شنبه‌ها: <span class="font-bold text-white">۰۸:۳۰ تا ۱۳:۰۰</span>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- بخش نقشه گوگل (سمت چپ در دسکتاپ) -->
        <section class="lg:col-span-7 bg-[#0a0a0c] border border-white/10 rounded-2xl p-2 relative h-[500px] lg:h-auto group flex flex-col">
          
          <div class="w-full flex-1 rounded-xl overflow-hidden relative">
            <!-- اورلی تاریک روی نقشه برای حفظ ظاهر سایت (با هاور شدن محو می‌شود) -->
            <div class="absolute inset-0 bg-[#050505]/40 mix-blend-color pointer-events-none group-hover:opacity-0 transition-opacity duration-700 z-10"></div>
            
            <!-- Iframe گوگل مپ -->
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d103716.14801934847!2d51.45288210273436!3d35.67381009999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8dff005b0c00c3%3A0x270a34905725df63!2z2KfYs9iq24zZhCDZhdmH2YHYpw!5e0!3m2!1sfa!2s!4v1783850998612!5m2!1sfa!2s" 
              class="w-full h-full grayscale-[80%] contrast-125 group-hover:grayscale-0 transition-all duration-700" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              title="نقشه گوگل دفتر استیل مهفا در بازار آهن شادآباد"
              referrerpolicy="strict-origin-when-cross-origin">
            </iframe>
          </div>

          <!-- دکمه‌های مسیریابی مستقیم (CTA) -->
          <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-full px-6 flex justify-center gap-3">
            <a 
              href="https://www.google.com/maps/place/%D8%A7%D8%B3%D8%AA%DB%8C%D9%84+%D9%85%D9%87%D9%81%D8%A7%E2%80%AD/@35.6738101,51.4528821,12z/data=!4m10!1m2!2m1!1z2KfYs9iq24zZhCDZhdmH2YHYp-KArQ!3m6!1s0x3f8dff005b0c00c3:0x270a34905725df63!8m2!3d35.6738101!4d51.3004468!15sChbYp9iz2KrbjNmEINmF2YfZgdin4oCtkgETY2hhbWJlcl9vZl9jb21tZXJjZeABAA!16s%2Fg%2F11njy8x8s3?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            >
              <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              مسیریابی با Google Maps
            </a>
          </div>
          
        </section>

      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
// ۱. تنظیم سئوی متا تگ‌ها به صورت کاملا استاتیک و قدرتمند
useSeoMeta({
  title: 'تماس با استیل مهفا | آدرس دفتر و انبار بازار آهن شادآباد',
  description: 'برای استعلام قیمت روز ورق و لوله استیل، مشاوره خرید تناژ بالا و هماهنگی بارگیری، با کارشناسان فروش استیل مهفا در بازار آهن تهران تماس بگیرید.',
  ogTitle: 'ارتباط با دپارتمان فروش استیل مهفا',
  ogDescription: 'شماره تلفن‌ها و آدرس دقیق انبار و دفتر مرکزی استیل مهفا در بازار آهن شادآباد جهت خرید بی‌واسطه مقاطع فولاد ضد زنگ.',
  ogType: 'website',
  ogUrl: 'https://mohafa.com/contact',
  twitterCard: 'summary_large_image'
})

// ۲. اسکیمای LocalBusiness فوق‌پیشرفته (متصل به گوگل مپ)
useHead({
  link: [
    { rel: 'canonical', href: 'https://mohafa.com/contact' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "استیل مهفا",
        "image": "https://mohafa.com/logo.png",
        "@id": "https://mohafa.com",
        "url": "https://mohafa.com",
        "telephone": ["+982166393755", "+982166391417"],
        "email": "info@mohafa.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "بزرگراه فتح، بازار آهن شادآباد، مجتمع تجاری پاییزان، بلوک ۲، پلاک ۱۸",
          "addressLocality": "تهران",
          "addressRegion": "تهران",
          "addressCountry": "IR"
        },
        "geo": {
          "@type": "GeoCoordinates",
          // مختصات استخراج شده از لینک مپ شما
          "latitude": 35.673810, 
          "longitude": 51.452882
        },
        "hasMap": "https://www.google.com/maps/search/%D8%A7%D8%B3%D8%AA%DB%8C%D9%84+%D9%85%D9%87%D9%81%D8%A7%E2%80%AD/@35.6895617,51.2763327,12z",
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
            "opens": "08:30",
            "closes": "17:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Thursday",
            "opens": "08:30",
            "closes": "13:00"
          }
        ],
        "sameAs": [
          "https://www.instagram.com/steelmahfa",
          "https://t.me/steelmahfa"
        ]
      })
    },
    // اسکیمای مسیر (Breadcrumb)
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "خانه",
            "item": "https://mohafa.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "تماس با ما",
            "item": "https://mohafa.com/contact"
          }
        ]
      })
    }
  ]
})
</script>