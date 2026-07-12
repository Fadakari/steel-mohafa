<template>
  <div class="fixed top-0 left-0 h-1 bg-[#84012B] z-50 transition-all duration-150 ease-out" :style="{ width: `${scrollProgress}%` }"></div>
  
  <div v-if="pending" class="min-h-screen bg-[#050505] pt-32 pb-12 flex justify-center items-center">
    <div class="flex flex-col items-center gap-4">
      <svg class="animate-spin h-10 w-10 text-[#84012B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span class="text-zinc-500 text-sm font-mono animate-pulse">در حال بارگذاری دانشنامه...</span>
    </div>
  </div>

  <div v-else-if="error || !article" class="min-h-screen bg-[#050505] pt-32 pb-12 flex flex-col items-center justify-center text-center px-4">
    <div class="w-24 h-24 mb-6 text-zinc-800">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    </div>
    <h1 class="text-2xl md:text-3xl text-white font-black mb-4">مقاله مورد نظر پیدا نشد یا حذف شده است!</h1>
    <p class="text-zinc-500 mb-8 max-w-md">ممکن است آدرس را اشتباه وارد کرده باشید یا این مقاله به بخش دیگری منتقل شده باشد.</p>
    <NuxtLink to="/blog" class="px-6 py-3 bg-white/5 hover:bg-[#84012B] border border-white/10 rounded-xl text-white font-bold transition-all flex items-center gap-2">
      <svg class="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      بازگشت به مرکز مقالات
    </NuxtLink>
  </div>

  <article v-else class="min-h-screen bg-[#050505] pt-28 md:pt-36 pb-20 px-4 md:px-8 selection:bg-[#84012B] selection:text-white">
    <div class="max-w-[850px] mx-auto">
      
      <nav aria-label="Breadcrumb" class="mb-8 md:mb-12">
        <ol class="flex flex-wrap items-center gap-2 text-xs md:text-sm font-mono text-zinc-500">
          <li><NuxtLink to="/" class="hover:text-white transition-colors">خانه</NuxtLink></li>
          <li>/</li>
          <li><NuxtLink to="/blog" class="hover:text-white transition-colors">دانشنامه استیل</NuxtLink></li>
          <li>/</li>
          <li class="text-[#ff477e] font-bold truncate max-w-[200px] md:max-w-[400px]">{{ article.title }}</li>
        </ol>
      </nav>

      <header class="mb-10 md:mb-16">
        <h1 class="text-3xl md:text-5xl font-black text-white leading-tight md:leading-[1.2] mb-6 md:mb-8 text-right">
          {{ article.title }}
        </h1>
        
        <div class="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-mono border-y border-white/5 py-4">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-[#84012B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>{{ new Date(article.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
          </div>
          <div class="w-1 h-1 rounded-full bg-zinc-700 hidden md:block"></div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-[#84012B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>زمان مطالعه: {{ readingTime }} دقیقه</span>
          </div>
          <div class="w-1 h-1 rounded-full bg-zinc-700 hidden md:block"></div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-[#84012B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span>مهندس اصغر فرخ‌نیا</span>
          </div>
        </div>
      </header>

      <div v-if="article.imageUrl" class="relative w-full aspect-[16/9] md:aspect-[2/1] mb-12 rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <img :src="`http://localhost:8055/assets/${article.imageUrl}`" :alt="article.title" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80"></div>
      </div>

      <div v-if="toc.length > 0" class="mb-12 bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 md:p-8">
        <h3 class="text-xl font-black text-white mb-6 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#84012B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
          فهرست مطالب این مقاله
        </h3>
        <ul class="space-y-3">
          <li v-for="item in toc" :key="item.id" class="text-zinc-200 font-bold">
            <button 
              @click="scrollToSection(item.id)"
              class="text-right hover:text-[#ff477e] transition-colors flex items-start gap-2 group w-full"
            >
              <span class="text-[#84012B] mt-1 shrink-0">▪</span>
              <span class="group-hover:translate-x-[-4px] transition-transform duration-300">{{ item.text }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="prose prose-invert prose-lg md:prose-xl max-w-none custom-article-content" v-html="processedContent"></div>

      <div class="mt-16 mb-8 p-6 md:p-8 bg-[#0a0a0c] border border-white/5 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 shadow-lg">
        <div class="shrink-0 relative">
          <img src="https://ui-avatars.com/api/?name=Asghar+Farahnia&background=84012B&color=fff" alt="مهندس اصغر فرخ‌نیا" class="w-24 h-24 rounded-full object-cover border-2 border-[#84012B] p-1" />
          <div class="absolute -bottom-2 -right-2 bg-[#050505] p-1.5 rounded-full border border-white/10">
            <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          </div>
        </div>
        
        <div class="flex flex-col text-center md:text-right w-full">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div>
              <h3 class="text-lg font-black text-white">مهندس اصغر فرخ‌نیا</h3>
              <span class="text-xs text-zinc-500 font-mono">کارشناس ارشد متالورژی و تحلیلگر بازار فولاد</span>
            </div>
            
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white rounded-lg transition-colors text-xs font-bold mx-auto md:mx-0 border border-[#0077b5]/20">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              مشاهده پروفایل لینکدین
            </a>
          </div>
          <p class="text-sm text-zinc-400 leading-relaxed">
            با بیش از ۱۰ سال سابقه در تامین و کنترل کیفیت مقاطع استنلس استیل. هدف من در این دانشنامه، ارائه اطلاعات دقیقِ مهندسی برای کمک به خریدهای ایمن و استاندارد در پروژه‌های صنعتی است.
          </p>
        </div>
      </div>

      <div v-if="relatedArticles && relatedArticles.length > 0" class="mt-20 pt-12 border-t border-white/5 relative">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#84012B] to-transparent opacity-50"></div>
        
        <h3 class="text-2xl font-black text-white mb-8 flex items-center gap-3">
          <svg class="w-6 h-6 text-[#84012B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14"></path></svg>
          شاید برای شما جالب باشد
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink 
            v-for="relArticle in relatedArticles" 
            :key="relArticle.id"
            :to="`/blog/${relArticle.slug}`"
            class="group bg-[#0a0a0c] border border-white/5 rounded-xl overflow-hidden hover:border-[#84012B]/50 transition-all duration-300 flex flex-col"
          >
            <div class="w-full h-40 overflow-hidden relative bg-[#111113]">
              <img 
                v-if="relArticle.imageUrl" 
                :src="`http://localhost:8055/assets/${relArticle.imageUrl}`" 
                :alt="relArticle.title" 
                class="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-zinc-700">
                <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            
            <div class="p-5 flex flex-col flex-grow">
              <h4 class="text-sm font-bold text-zinc-200 leading-snug group-hover:text-white transition-colors line-clamp-2 mb-3">
                {{ relArticle.title }}
              </h4>
              <div class="mt-auto flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>{{ new Date(relArticle.publishedAt).toLocaleDateString('fa-IR') }}</span>
                <span class="text-[#ff477e] group-hover:translate-x-[-4px] transition-transform duration-300">مطالعه ➔</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <footer class="mt-12 pt-8 border-t border-white/10">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0a0a0c] p-6 rounded-2xl border border-white/5">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#84012B] flex items-center justify-center text-white font-bold text-xl">M</div>
            <div>
              <p class="text-white font-bold">مهندسی فروش استیل مهفا</p>
              <p class="text-xs text-zinc-400 mt-1">جهت مشاوره فنی و خرید مقاطع استیل با ما تماس بگیرید.</p>
            </div>
          </div>
          <a href="tel:02112345678" class="w-full md:w-auto text-center px-8 py-3 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] active:scale-95">
            تماس با کارشناسان
          </a>
        </div>
      </footer>

    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()
const rawSlug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug

// درخواست مستقیم به API
const { data: article, pending, error } = await useFetch(`/api/articles/${rawSlug}`, {
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
})

// ۲. دریافت مقالات مرتبط
const { data: relatedArticlesRaw } = await useFetch('/api/articles', {
  query: { limit: 4 },
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
})

// فیلتر کردن مقاله فعلی از لیست مقالات مرتبط تا مقاله تکراری به کاربر پیشنهاد نشود
const relatedArticles = computed(() => {
  if (!relatedArticlesRaw.value) return []
  return relatedArticlesRaw.value
    .filter((item: any) => item.slug !== rawSlug) // حذف مقاله فعلی از لیست
    .slice(0, 3) // برداشتن دقیقا ۳ مقاله
})

// محاسبه اتوماتیک زمان مطالعه بر اساس تعداد کلمات (هر 200 کلمه = 1 دقیقه)
const readingTime = computed(() => {
  if (!article.value?.content) return 3;
  // حذف تگ‌های HTML برای شمارش دقیق کلمات
  const text = article.value.content.replace(/<[^>]*>?/gm, '');
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
})

// لینک کانونیکال برای سئو
const canonicalUrl = `https://mohafa.com/blog/${rawSlug}`

// اعمال متادیتاها و اسکیما در هدر سایت
useHead(() => {
  if (!article.value) return {}

  const articleImageUrl = article.value.imageUrl ? `http://localhost:8055/assets/${article.value.imageUrl}` : 'https://mohafa.com/default-blog-image.jpg'

  const schemas = []

  // ۱. اسکیمای Article (بسیار مهم برای سئوی محتوا)
  schemas.push({
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "headline": article.value.title,
      "description": article.value.metaDescription,
      "image": articleImageUrl,
      "datePublished": article.value.publishedAt,
      "dateModified": article.value.updatedAt || article.value.publishedAt,
      "author": {
        "@type": "Person",
        "name": "مهندس اصغر فرخ‌نیا",
        "url": "https://linkedin.com/in/author-profile",
        "jobTitle": "کارشناس ارشد متالورژی"
      },
      "publisher": {
        "@type": "Organization",
        "name": "استیل مهفا",
        "logo": {
          "@type": "ImageObject",
          "url": "https://mohafa.com/logo.png"
        }
      }
    })
  })

  // ۲. اسکیمای Breadcrumb
  schemas.push({
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "خانه", "item": "https://mohafa.com/" },
        { "@type": "ListItem", "position": 2, "name": "دانشنامه استیل", "item": "https://mohafa.com/blog" },
        { "@type": "ListItem", "position": 3, "name": article.value.title, "item": canonicalUrl }
      ]
    })
  })

  return {
    title: `${article.value.title} | دانشنامه استیل مهفا`,
    meta: [
      { name: 'description', content: article.value.metaDescription },
      // Open Graph
      { property: 'og:title', content: article.value.title },
      { property: 'og:description', content: article.value.metaDescription },
      { property: 'og:image', content: articleImageUrl },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: 'article' },
      { property: 'article:published_time', content: article.value.publishedAt },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: article.value.title },
      { name: 'twitter:description', content: article.value.metaDescription },
      { name: 'twitter:image', content: articleImageUrl }
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl }
    ],
    script: schemas
  }
})

const scrollProgress = ref(0)

const updateScroll = () => {
  const scrollPx = document.documentElement.scrollTop
  const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight
  scrollProgress.value = (scrollPx / winHeightPx) * 100
}

onMounted(() => {
  window.addEventListener('scroll', updateScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScroll)
})


// استخراج اتوماتیک فهرست مطالب (Table of Contents) و ساخت ID برای اسکرول
const toc = ref<{ id: string; text: string; level: number }[]>([])

const processedContent = computed(() => {
  if (!article.value?.content) return ''

  let currentToc: { id: string; text: string; level: number }[] = []
  
  // فقط H2 ها را می‌گیریم تا فهرست کوتاه و کاربردی باشد
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi
  
  const newContent = article.value.content.replace(regex, (match, text) => {
    // ۱. پاکسازی تگ‌های HTML اضافی
    let cleanText = text.replace(/<[^>]+>/g, '').trim()
    // ۲. تبدیل کدهای مخرب مثل &zwnj; به نیم‌فاصله واقعی و &nbsp; به فاصله
    cleanText = cleanText.replace(/&zwnj;/g, '\u200C').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    
    // ۳. ساخت ID تمیز (پشتیبانی از حروف فارسی و نیم‌فاصله)
    const id = cleanText.replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF\u200C-]/g, '')
    
    currentToc.push({
      id,
      text: cleanText,
      level: 2
    })

    return `<h2 id="${id}" class="scroll-mt-32">${text}</h2>` 
  })

  toc.value = currentToc
  return newContent
})

// تابع اسکرول نرم به بخش مربوطه
const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
/* ۱. رفع مشکل رنگ مشکی و پس‌زمینه سفید:
  استفاده از important! باعث می‌شود تمام رنگ‌های مخفی که از ادیتور مدیریت می‌آیند بی‌اثر شوند.
*/
:deep(.custom-article-content),
:deep(.custom-article-content *) {
  color: #e4e4e7 !important; /* رنگ نقره‌ای روشن و خوانا برای کل متن */
  background-color: transparent !important; /* حذف هرگونه پس‌زمینه سفیدی که از Word کپی شده */
  line-height: 1.8;
  text-align: justify;
}

@media (min-width: 768px) {
  :deep(.custom-article-content) {
    line-height: 2.2; /* فاصله مناسب خطوط در دسکتاپ (معادل md:leading-loose) */
  }
}

/* ۲. استایل‌دهی به تگ‌های خاص (تیترها، لینک‌ها و...) */
:deep(.custom-article-content h2), 
:deep(.custom-article-content h2 *) {
  color: #ffffff !important;
  font-size: 1.5rem;
  font-weight: 900;
  margin-top: 3.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}
@media (min-width: 768px) {
  :deep(.custom-article-content h2), :deep(.custom-article-content h2 *) { font-size: 1.875rem; }
}
:deep(.custom-article-content h2::after) {
  content: '';
  position: absolute;
  bottom: -1px;
  right: 0;
  width: 4rem;
  height: 2px;
  background-color: #84012B;
}

:deep(.custom-article-content h3), 
:deep(.custom-article-content h3 *) {
  color: #f4f4f5 !important;
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

:deep(.custom-article-content p) {
  margin-bottom: 1.5rem;
}

/* لینک‌های داخل متن */
:deep(.custom-article-content a), 
:deep(.custom-article-content a *) {
  color: #ff477e !important; /* رنگ صورتی/زرشکی روشن برای لینک‌ها */
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}
:deep(.custom-article-content a:hover), 
:deep(.custom-article-content a:hover *) {
  text-decoration-color: #ff477e;
}

/* لیست‌ها (نقطه‌ای و شماره‌ای) */
:deep(.custom-article-content ul), 
:deep(.custom-article-content ol) {
  background-color: #0c0c0e !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem 1.5rem 1.5rem 2.5rem;
  margin: 2rem 0;
}
:deep(.custom-article-content li) {
  margin-bottom: 0.75rem;
}
:deep(.custom-article-content li::marker) {
  color: #84012B !important;
  font-weight: bold;
}

/* نقل‌قول‌ها (بخش‌های مهم) */
:deep(.custom-article-content blockquote) {
  border-right: 4px solid #84012B;
  background: linear-gradient(to left, rgba(132, 1, 43, 0.1), transparent) !important;
  padding: 1rem 1.5rem;
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
  font-style: italic;
  margin: 2.5rem 0;
}

/* تصاویر داخل متن */
:deep(.custom-article-content img) {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  margin: 2.5rem auto;
  max-width: 100%;
  height: auto;
}

/* ۳. جداول قدرتمند مهندسی (کاملا ریسپانسیو) 
*/
:deep(.custom-article-content table) {
  width: 100%;
  font-size: 0.875rem;
  text-align: right;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 2.5rem 0;
  display: block; /* برای اسکرول افقی در موبایل */
  overflow-x: auto;
  white-space: nowrap; /* جلوگیری از به هم ریختگی جدول در موبایل */
}
@media (min-width: 768px) {
  :deep(.custom-article-content table) {
    display: table;
    white-space: normal;
  }
}
:deep(.custom-article-content thead) {
  background-color: #111113 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
:deep(.custom-article-content th),
:deep(.custom-article-content th *) {
  padding: 1rem;
  font-weight: 900;
  color: #ffffff !important;
  text-transform: uppercase;
}
:deep(.custom-article-content td),
:deep(.custom-article-content td *) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background-color: #0a0a0c !important;
}
:deep(.custom-article-content tbody tr:hover td),
:deep(.custom-article-content tbody tr:hover td *) {
  background-color: #151518 !important;
}
</style>