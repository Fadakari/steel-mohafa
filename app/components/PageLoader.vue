<template>
  <Transition name="loader-fade">
    <div v-if="isLoading" class="fixed inset-0 z-[99999] bg-[#0a0a0c] flex flex-col items-center justify-center">
      
      <!-- Elegant custom animation matching Mahfa Steel theme -->
      <div class="relative w-20 h-20 flex items-center justify-center">
        <!-- Outer sweeping ring -->
        <div class="absolute inset-0 rounded-full border border-white/5 border-t-red-600 animate-[spin_1.2s_cubic-bezier(0.5,0,0.5,1)_infinite] shadow-[0_0_20px_rgba(220,38,38,0.3)]"></div>
        
        <!-- Inner reverse ring -->
        <div class="absolute inset-3 rounded-full border border-white/5 border-b-red-500/80 animate-[spin_1.8s_cubic-bezier(0.5,0,0.5,1)_infinite_reverse]"></div>
        
        <!-- Core glowing dot -->
        <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)]"></div>
      </div>
      
      <div class="mt-8 text-white/50 font-medium text-sm tracking-[0.2em] animate-pulse">
        در حال بارگذاری
      </div>
      
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'

const isLoading = ref(false)
const nuxtApp = useNuxtApp()
const router = useRouter()

onMounted(() => {
  // Triggered immediately when navigation is requested
  const unregisterRouter = router.beforeEach((to, from, next) => {
    try {
      if (decodeURIComponent(to.path) !== decodeURIComponent(from.path)) {
        isLoading.value = true
      }
    } catch (e) {
      if (to.path !== from.path) {
        isLoading.value = true
      }
    }
    next()
  })

  // Triggered when Suspense is fully resolved and page is rendered
  nuxtApp.hook('page:finish', () => {
    // A tiny delay ensures the DOM is painted before the overlay vanishes
    setTimeout(() => {
      isLoading.value = false
    }, 150)
  })

  // Ensure loader disappears if navigation fails
  router.onError(() => {
    isLoading.value = false
  })

  onUnmounted(() => {
    unregisterRouter()
  })
})
</script>

<style scoped>
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.4s ease, backdrop-filter 0.4s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}
</style>
