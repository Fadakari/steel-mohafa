<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
    <nav class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      
      <!-- ۱. لوگو و برند -->
      <NuxtLink to="/" class="flex items-center gap-2">
        <div class="w-8 h-8 bg-[#84012B] rounded-lg"></div>
        <span class="text-xl font-bold text-white tracking-tight">استیل مهفا</span>
      </NuxtLink>

      <!-- ۲. منوی دسکتاپ -->
      <div class="hidden md:flex items-center gap-8">
        <NuxtLink to="/products" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">محصولات</NuxtLink>
        <NuxtLink to="/services" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">خدمات فنی</NuxtLink>
        <NuxtLink to="/blog" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">مقالات</NuxtLink>
        <NuxtLink to="/contact" class="text-sm font-medium text-gray-300 hover:text-white transition-colors">تماس با ما</NuxtLink>
      </div>

      <!-- ۳. بخش اکشن (مود + دکمه) -->
      <div class="flex items-center gap-4">
        
        <NuxtLink to="/quote" class="hidden md:block px-5 py-2.5 bg-[#84012B] hover:bg-[#a30034] text-white text-sm font-semibold rounded-full transition-all">
          استعلام قیمت
        </NuxtLink>

        <!-- دکمه موبایل -->
        <button @click="isOpen = !isOpen" class="md:hidden p-2 text-white relative w-10 h-10 focus:outline-none">
          <div class="absolute left-1/2 top-1/2 block w-6 -translate-x-1/2 -translate-y-1/2 transform">
            <span aria-hidden="true" :class="{'rotate-45': isOpen, '-translate-y-2': !isOpen}" class="block absolute h-0.5 w-6 bg-current transform transition duration-500 ease-in-out"></span>
            <span aria-hidden="true" :class="{'opacity-0': isOpen }" class="block absolute h-0.5 w-6 bg-current transform transition duration-500 ease-in-out"></span>
            <span aria-hidden="true" :class="{'-rotate-45': isOpen, 'translate-y-2': !isOpen}" class="block absolute h-0.5 w-6 bg-current transform transition duration-500 ease-in-out"></span>
          </div>
        </button>
      </div>
    </nav>

    <!-- منوی موبایل -->
    <Transition name="mobile-menu">
      <div v-if="isOpen" class="md:hidden absolute top-20 left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex flex-col gap-4 shadow-2xl">
        <NuxtLink to="/products" class="mobile-link text-lg text-white font-medium" @click="isOpen = false">محصولات</NuxtLink>
        <NuxtLink to="/services" class="mobile-link text-lg text-white font-medium" @click="isOpen = false">خدمات فنی</NuxtLink>
        <NuxtLink to="/blog" class="mobile-link text-lg text-white font-medium" @click="isOpen = false">مقالات</NuxtLink>
        <NuxtLink to="/contact" class="mobile-link text-lg text-white font-medium" @click="isOpen = false">تماس با ما</NuxtLink>
      </div>
    </Transition>
  </header>
</template>

<script setup>
const isOpen = ref(false)
</script>

<style scoped>
/* انیمیشن باز و بسته شدن کل منو */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* انیمیشن ورود لینک‌ها با تاخیر ریاضی‌وار (Staggered) */
.mobile-menu-enter-active .mobile-link {
  animation: fade-slide-in 0.4s ease-out backwards;
}
.mobile-menu-enter-active .mobile-link:nth-child(1) { animation-delay: 0.1s; }
.mobile-menu-enter-active .mobile-link:nth-child(2) { animation-delay: 0.15s; }
.mobile-menu-enter-active .mobile-link:nth-child(3) { animation-delay: 0.2s; }
.mobile-menu-enter-active .mobile-link:nth-child(4) { animation-delay: 0.25s; }

@keyframes fade-slide-in {
  0% { 
    opacity: 0; 
    transform: translateX(20px); 
  }
  100% { 
    opacity: 1; 
    transform: translateX(0); 
  }
}
</style>