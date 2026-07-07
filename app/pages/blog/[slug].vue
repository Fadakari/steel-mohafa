<template>
  <div v-if="pending" class="min-h-screen bg-[#050505] pt-28 pb-12 flex justify-center">
    <svg class="animate-spin h-8 w-8 text-[#84012B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
  </div>

  <div v-else-if="error || !article" class="min-h-screen bg-[#050505] pt-28 pb-12 text-center">
    <h1 class="text-2xl text-white font-bold mb-4">مقاله مورد نظر پیدا نشد!</h1>
    <NuxtLink to="/blog" class="text-[#84012B] hover:text-white transition-colors">بازگشت به مقالات ⟵</NuxtLink>
  </div>

  <article v-else class="min-h-screen bg-[#050505] pt-28 pb-12 px-4 md:px-8">
    <div class="max-w-3xl mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl md:text-5xl font-black text-white leading-tight mb-6">{{ article.title }}</h1>
        <div class="flex items-center gap-4 text-sm text-zinc-500 font-mono">
          <span>{{ new Date(article.publishedAt).toLocaleDateString('fa-IR') }}</span>
          <span>•</span>
          <span>خواندن ۵ دقیقه</span>
        </div>
      </header>

      <img v-if="article.imageUrl" :src="article.imageUrl" :alt="article.title" class="w-full h-64 md:h-96 object-cover rounded-2xl mb-10" />

      <div 
        class="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-[#84012B] prose-img:rounded-xl leading-relaxed"
        v-html="article.content"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()

// گرفتن اسلاگ به ساده‌ترین شکل ممکن
const rawSlug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug

// درخواست مستقیم به API
const { data: article, pending, error } = await useFetch(`/api/articles/${rawSlug}`)

// سئو
useSeoMeta({
  title: () => article.value?.title || 'مقاله',
  description: () => article.value?.metaDescription || '',
  ogTitle: () => article.value?.title || '',
  ogDescription: () => article.value?.metaDescription || '',
  ogImage: () => article.value?.imageUrl || '',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.value?.title || '',
        "description": article.value?.metaDescription || '',
        "image": article.value?.imageUrl || '',
        "datePublished": article.value?.publishedAt || '',
        "author": { "@type": "Organization", "name": "استیل مهفا" }
      })
    }
  ]
})
</script>

<style>
.prose p { margin-bottom: 1.5em; color: #fff; }
table, div { color: #fff;}
.prose h2, .prose h3 { margin-top: 2em; margin-bottom: 1em; color: #fff; }
.prose ul, .prose ol { padding-right: 1.5em; margin-bottom: 1.5em; }
.prose li { margin-bottom: 0.5em; }
</style>