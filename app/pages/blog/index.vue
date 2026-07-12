<template>
  <div class="min-h-screen bg-[#050505] pt-28 md:pt-36 pb-20 px-4 md:px-8 selection:bg-[#84012B] selection:text-white">
    <div class="max-w-6xl mx-auto">
      
      <header class="mb-12 md:mb-16 text-center md:text-right border-b border-white/5 pb-8 relative">
        <div class="absolute left-0 bottom-0 w-32 h-1 bg-gradient-to-r from-transparent to-[#84012B]"></div>
        <h1 class="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          دانشنامه <span class="text-[#84012B]">استیل مهفا</span>
        </h1>
        <p class="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
          مرجع تخصصی مقالات مهندسی متالورژی، راهنمای خرید مقاطع استنلس استیل، اخبار بازار آهن و تحلیل‌های کاربردی برای صنایع.
        </p>
      </header>

      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="flex flex-col gap-4 bg-[#0a0a0c] p-4 border border-white/5 rounded-2xl animate-pulse">
          <div class="w-full h-48 bg-white/5 rounded-xl"></div>
          <div class="w-3/4 h-6 bg-white/5 rounded-md mt-2"></div>
          <div class="w-full h-4 bg-white/5 rounded-md"></div>
          <div class="w-2/3 h-4 bg-white/5 rounded-md"></div>
        </div>
      </div>

      <div v-else-if="articles && articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <NuxtLink 
          v-for="(article, index) in articles" 
          :key="article.id" 
          :to="`/blog/${article.slug}`"
          class="group flex flex-col bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden hover:border-[#84012B]/50 transition-all duration-500 hover:shadow-[0_10px_30px_-10px_rgba(132,1,43,0.3)] hover:-translate-y-1 relative"
        >
          <div class="absolute top-0 left-0 w-full h-1 bg-[#84012B] transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10"></div>

          <div class="relative w-full h-56 overflow-hidden bg-[#111113]">
            <img 
              v-if="article.imageUrl" 
              :src="`http://localhost:8055/assets/${article.imageUrl}`" 
              :alt="article.title" 
              class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
            />
            <div v-else class="w-full h-full flex items-center justify-center text-zinc-700">
              <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            
            <div class="absolute bottom-3 right-3 bg-[#050505]/80 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono text-zinc-300 shadow-lg">
              <svg class="w-3.5 h-3.5 text-[#84012B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {{ new Date(article.publishedAt).toLocaleDateString('fa-IR') }}
            </div>
          </div>

          <div class="p-6 flex flex-col flex-grow">
            <h2 class="text-lg md:text-xl font-bold text-zinc-100 mb-3 leading-snug group-hover:text-white transition-colors line-clamp-2">
              {{ article.title }}
            </h2>
            <p class="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6 flex-grow text-justify">
              {{ article.metaDescription }}
            </p>
            
            <div class="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-[#111113] border border-[#84012B] flex items-center justify-center text-[10px] font-bold text-zinc-400">MA</div>
                <span class="text-xs text-zinc-500 font-mono">ا. فرخ‌نیا</span>
              </div>
              <span class="text-xs font-bold text-[#ff477e] flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform duration-300">
                مطالعه مقاله
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-20 bg-[#0a0a0c] border border-white/5 rounded-2xl">
        <p class="text-zinc-500">در حال حاضر مقاله‌ای برای نمایش وجود ندارد.</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const { data: articles, pending } = await useFetch('/api/articles', {
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
})

// سئوی پیشرفته برای صفحه لیست مقالات
useHead(() => {
  const pageTitle = 'دانشنامه و مقالات تخصصی استیل | استیل مهفا'
  const pageDescription = 'جدیدترین مقالات آموزشی، راهنمای خرید مقاطع استیل، تحلیل بازار آهن و متالورژی کاربردی را در دانشنامه تخصصی استیل مهفا مطالعه کنید.'
  const canonicalUrl = 'https://mohafa.com/blog'

  return {
    title: pageTitle,
    meta: [
      { name: 'description', content: pageDescription },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: pageDescription },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: 'website' }
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": pageTitle,
          "description": pageDescription,
          "url": canonicalUrl,
          "publisher": {
            "@type": "Organization",
            "name": "استیل مهفا"
          }
        })
      }
    ]
  }
})
</script>