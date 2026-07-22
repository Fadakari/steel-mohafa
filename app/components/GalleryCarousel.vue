<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface ImageItem {
  src: string
  alt: string
  title?: string
  badge?: string
}

defineProps<{
  images: ImageItem[]
  autoplayDelay?: number
  heightClass?: string
}>()

const modules = [Autoplay, EffectFade, Navigation, Pagination]
</script>

<template>
  <div class="relative w-full h-full overflow-hidden rounded-2xl group bg-slate-950/80 border border-slate-800/80 backdrop-blur-sm">
    <Swiper
      :modules="modules"
      :slides-per-view="1"
      :loop="true"
      :effect="'fade'"
      :fade-effect="{ crossFade: true }"
      :autoplay="{
        delay: autoplayDelay || 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      }"
      :pagination="{ clickable: true, dynamicBullets: true }"
      class="w-full h-full custom-swiper"
    >
      <SwiperSlide
        v-for="(img, idx) in images"
        :key="idx"
        class="relative w-full h-full flex items-center justify-center overflow-hidden"
      >
        <!-- Background Blur effect for vertical or fit images -->
        <div 
          class="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-110 pointer-events-none"
          :style="{ backgroundImage: `url(${img.src})` }"
        ></div>

        <!-- Main Image: object-contain with left-bottom focal point to ensure watermark visibility -->
        <img
          :src="img.src"
          :alt="img.alt"
          class="w-full h-full object-contain object-left-bottom z-10 transition-transform duration-700 hover:scale-[1.02]"
          loading="lazy"
        />

        <!-- Optional Content Overlay / Badge -->
        <div v-if="img.badge || img.title" class="absolute top-4 right-4 z-20 flex flex-col items-end gap-1 pointer-events-none">
          <span v-if="img.badge" class="px-3 py-1 text-xs font-medium text-amber-400 bg-amber-950/60 border border-amber-500/30 rounded-full backdrop-blur-md">
            {{ img.badge }}
          </span>
          <span v-if="img.title" class="px-3 py-1.5 text-sm font-semibold text-slate-100 bg-slate-900/80 border border-slate-700/50 rounded-xl backdrop-blur-md">
            {{ img.title }}
          </span>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style>
/* Customizing Swiper Bullets for Dark Theme */
.custom-swiper .swiper-pagination-bullet {
  background: #94a3b8 !important;
  opacity: 0.5;
}
.custom-swiper .swiper-pagination-bullet-active {
  background: #f59e0b !important; /* Amber accent */
  opacity: 1;
  width: 18px;
  border-radius: 4px;
}
</style>