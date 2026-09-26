<script setup lang="ts">
import type { NuxtError } from '#app'
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'

defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#050505] font-sans antialiased text-gray-400" dir="rtl">
    <SiteHeader />
    
    <main class="flex-grow flex items-center justify-center p-6 pt-32 pb-32 relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#84012B] opacity-10 rounded-full blur-[100px] z-0 pointer-events-none"></div>

      <div class="relative z-10 text-center max-w-lg mx-auto bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-10 rounded-3xl shadow-2xl">
        <h1 class="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 drop-shadow-sm mb-4" style="line-height: 1.2;">
          {{ error?.statusCode === 404 ? '۴۰۴' : (error?.statusCode || 'خطا') }}
        </h1>
        
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">
          {{ error?.statusCode === 404 ? 'صفحه مورد نظر پیدا نشد!' : 'مشکلی پیش آمد!' }}
        </h2>
        
        <p class="text-zinc-400 mb-8 leading-relaxed">
          {{ error?.statusCode === 404 
            ? 'متاسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد، حذف شده است یا آدرس آن تغییر کرده است.' 
            : 'متاسفانه در پردازش درخواست شما مشکلی به وجود آمده است. لطفاً دوباره تلاش کنید.' }}
        </p>
        
        <button 
          @click="handleError"
          class="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-l from-[#84012B] to-[#c20a45] hover:from-[#6B0022] hover:to-[#a00738] text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#84012B]/30 hover:shadow-[#84012B]/50 hover:-translate-y-1"
        >
          <span>بازگشت به صفحه اصلی</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>
    </main>
    
    <LazySiteFooter />
  </div>
</template>
