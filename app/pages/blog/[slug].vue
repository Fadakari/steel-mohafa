<template>
  <article v-if="article" class="min-h-screen bg-[#050505] pt-28 pb-12 px-4 md:px-8">
    <div class="max-w-3xl mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl md:text-5xl font-black text-white leading-tight mb-6">{{ article.title }}</h1>
        <div class="flex items-center gap-4 text-sm text-zinc-500 font-mono">
          <span>{{ new Date(article.publishedAt).toLocaleDateString('fa-IR') }}</span>
          <span>•</span>
          <span>خواندن ۵ دقیقه</span>
        </div>
      </header>

      <img v-if="article.imageUrl" :src="article.imageUrl" :alt="article.title" class="w-full h-96 object-cover rounded-2xl mb-10" />

      <div 
        class="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-[#84012B] prose-img:rounded-xl"
        v-html="article.content"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = computed(() => decodeURIComponent(route.params.slug as string))

// دریافت دیتا از API (دقت کنید که به مسیر API درخواست می‌زنیم)
const { data: article, pending } = await useFetch(`/api/articles/${slug.value}`)
// سئو پیشرفته و JSON-LD
useSeoMeta({
  title: () => article.value?.title,
  description: () => article.value?.metaDescription,
  ogTitle: () => article.value?.title,
  ogDescription: () => article.value?.metaDescription,
  ogImage: () => article.value?.imageUrl,
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.value?.title,
        "description": article.value?.metaDescription,
        "image": article.value?.imageUrl,
        "datePublished": article.value?.publishedAt,
        "author": { "@type": "Organization", "name": "استیل مهفا" }
      })
    }
  ]
})
</script>