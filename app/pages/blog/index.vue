<template>
  <div class="min-h-screen bg-[#050505] pt-28 pb-12 px-4 md:px-8">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-4xl font-black text-white mb-10">وبلاگ مهفا</h1>
      
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="i in 4" :key="i" class="h-64 bg-white/5 animate-pulse rounded-2xl"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink 
          v-for="article in articles" 
          :key="article.id" 
          :to="`/blog/${article.slug}`"
          class="group bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden hover:border-[#84012B] transition-all"
        >
          <img v-if="article.imageUrl" :src="article.imageUrl" :alt="article.title" class="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          <div class="p-6">
            <h2 class="text-xl font-bold text-white mb-3 leading-snug">{{ article.title }}</h2>
            <p class="text-sm text-zinc-400 line-clamp-3">{{ article.metaDescription }}</p>
            <div class="mt-4 text-xs text-[#84012B] font-mono">
              {{ new Date(article.publishedAt).toLocaleDateString('fa-IR') }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: articles, pending } = await useFetch('/api/articles')
</script>