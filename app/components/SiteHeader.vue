<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)
const isDesktopProductsHovered = ref(false)
const isMobileProductsOpen = ref(false)

// گرفتن داینامیک دسته‌ها از دیتابیس
const { data: categories } = await useFetch('/api/categories')

// مدیریت باز و بسته بودن زیردسته‌ها در موبایل
const openMobileSubcategories = ref<Record<number, boolean>>({})

const toggleMobileSubcategory = (id: number) => {
  openMobileSubcategories.value[id] = !openMobileSubcategories.value[id]
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  isMobileProductsOpen.value = false
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
    <nav itemscope itemtype="https://schema.org/SiteNavigationElement" aria-label="منوی اصلی" class="max-w-7xl mx-auto px-4 md:px-6 h-[80px] flex items-center justify-between">
      
      <NuxtLink to="/" class="flex items-center gap-2 z-50" aria-label="صفحه اصلی استیل مهفا">
        <div class="w-8 h-8 bg-[#84012B] rounded-lg shadow-[0_0_15px_rgba(132,1,43,0.5)]"></div>
        <span class="text-xl font-black text-white tracking-tight">استیل مهفا</span>
      </NuxtLink>

      <ul class="hidden md:flex items-center gap-8 h-full">
        <li itemprop="name">
          <NuxtLink itemprop="url" to="/" class="text-sm font-bold text-zinc-300 hover:text-white transition-colors">خانه</NuxtLink>
        </li>
        
        <li 
          class="h-full flex items-center relative"
          @mouseenter="isDesktopProductsHovered = true"
          @mouseleave="isDesktopProductsHovered = false"
        >
          <NuxtLink itemprop="url" to="/products" class="text-sm font-bold text-zinc-300 hover:text-white transition-colors flex items-center gap-1">
            <span itemprop="name">محصولات</span>
            <svg class="w-4 h-4 transition-transform duration-300" :class="isDesktopProductsHovered ? 'rotate-180 text-[#84012B]' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </NuxtLink>

          <!-- مگامنوی بهینه‌شده: عرض ۸۰۰ پیکسل، سه ستونه، همراه با محدودیت ارتفاع -->
          <Transition name="dropdown">
            <div v-show="isDesktopProductsHovered" class="absolute top-[70px] right-0 w-[800px] max-h-[calc(100vh-90px)] overflow-y-auto custom-scrollbar bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6 cursor-default">
              
              <div class="mb-5 border-b border-white/5 pb-4 flex justify-between items-center shrink-0">
                <span class="text-zinc-400 text-xs font-mono">دسته‌بندی جامع محصولات</span>
                <NuxtLink itemprop="url" to="/products" class="inline-flex items-center gap-1 text-sm font-black text-white hover:text-[#84012B] transition-colors">
                  <span>مشاهده همه محصولات</span>
                  <span>⟵</span>
                </NuxtLink>
              </div>
              
              <!-- تغییر به ۳ ستون برای کاهش شدید ارتفاع -->
              <ul class="grid grid-cols-3 gap-x-6 gap-y-5">
                <li v-for="cat in categories" :key="cat.id" itemprop="name" class="flex flex-col">
                  <NuxtLink 
                    itemprop="url" 
                    :to="`/products/${cat.slug}`" 
                    class="text-sm font-bold text-zinc-100 hover:text-[#84012B] transition-colors mb-1.5 inline-block"
                  >
                    {{ cat.name }}
                  </NuxtLink>
                  
                  <ul v-if="cat.children && cat.children.length > 0" class="flex flex-col gap-1">
                    <li v-for="child in cat.children" :key="child.id" itemprop="name">
                      <NuxtLink 
                        itemprop="url" 
                        :to="`/products/${cat.slug}/${child.slug}`" 
                        class="text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 before:content-[''] before:w-1 before:h-1 before:bg-zinc-700 before:rounded-full hover:before:bg-[#84012B]"
                      >
                        {{ child.name }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </Transition>
        </li>

        <li itemprop="name">
          <NuxtLink itemprop="url" to="/blog" class="text-sm font-bold text-zinc-300 hover:text-white transition-colors">وبلاگ</NuxtLink>
        </li>
        <li itemprop="name">
          <NuxtLink itemprop="url" to="/about" class="text-sm font-bold text-zinc-300 hover:text-white transition-colors">درباره ما</NuxtLink>
        </li>
        <li itemprop="name">
          <NuxtLink itemprop="url" to="/contact" class="text-sm font-bold text-zinc-300 hover:text-white transition-colors">تماس با ما</NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-4 z-50">
        <NuxtLink to="/quote" class="hidden md:block px-5 py-2.5 bg-[#84012B] hover:bg-[#a30034] text-white text-sm font-bold rounded-lg transition-all shadow-[0_4px_14px_0_rgba(132,1,43,0.39)]">
          استعلام قیمت
        </NuxtLink>

        <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2 text-white relative w-10 h-10 focus:outline-none bg-white/5 rounded-lg">
          <div class="absolute left-1/2 top-1/2 block w-5 -translate-x-1/2 -translate-y-1/2 transform">
            <span aria-hidden="true" :class="{'rotate-45': isMobileMenuOpen, '-translate-y-1.5': !isMobileMenuOpen}" class="block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out rounded-full"></span>
            <span aria-hidden="true" :class="{'opacity-0': isMobileMenuOpen }" class="block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out rounded-full"></span>
            <span aria-hidden="true" :class="{'-rotate-45': isMobileMenuOpen, 'translate-y-1.5': !isMobileMenuOpen}" class="block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out rounded-full"></span>
          </div>
        </button>
      </div>
    </nav>

    <!-- منوی موبایل (فول‌اسکرین) -->
    <Transition name="mobile-menu">
      <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 z-40 bg-[#050505] overflow-y-auto pt-[80px] pb-12 min-h-screen">
        <ul class="flex flex-col p-6 gap-2">
          <li>
            <NuxtLink to="/" class="mobile-link block py-3 text-lg font-bold text-zinc-200 border-b border-white/5" @click="closeMobileMenu">خانه</NuxtLink>
          </li>
          
          <li>
            <button @click="isMobileProductsOpen = !isMobileProductsOpen" class="mobile-link w-full flex items-center justify-between py-3 text-lg font-bold text-zinc-200 border-b border-white/5">
              <span>محصولات</span>
              <svg class="w-5 h-5 transition-transform duration-300" :class="isMobileProductsOpen ? 'rotate-180 text-[#84012B]' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            <Transition name="accordion">
              <ul v-show="isMobileProductsOpen" class="bg-[#0a0a0c] rounded-lg mt-2 border border-white/10 overflow-hidden">
                <li>
                  <NuxtLink to="/products" class="block py-4 px-4 text-sm font-black text-white bg-[#84012B] shadow-[0_4px_14px_0_rgba(132,1,43,0.39)]" @click="closeMobileMenu">
                    مشاهده همه محصولات ⟵
                  </NuxtLink>
                </li>
                
                <li v-for="cat in categories" :key="cat.id" class="border-b border-white/5 last:border-none">
                  <button @click="toggleMobileSubcategory(cat.id)" class="w-full flex items-center justify-between px-4 py-3.5 group">
                    <span class="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                      {{ cat.name }}
                    </span>
                    <svg v-if="cat.children && cat.children.length > 0" class="w-4 h-4 text-zinc-500 transition-transform duration-300" :class="openMobileSubcategories[cat.id] ? 'rotate-180 text-[#84012B]' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  
                  <Transition name="accordion">
                    <ul v-show="openMobileSubcategories[cat.id]" class="bg-[#050505]/50 pb-2 flex flex-col">
                      <li>
                        <NuxtLink :to="`/products/${cat.slug}`" class="block py-2.5 pr-6 pl-4 text-xs font-bold text-[#84012B] hover:text-white transition-colors" @click="closeMobileMenu">
                          مشاهده همه {{ cat.name }} ⟵
                        </NuxtLink>
                      </li>
                      <li v-for="child in cat.children" :key="child.id">
                        <NuxtLink :to="`/products/${cat.slug}/${child.slug}`" class="block py-2 pr-8 pl-4 text-xs font-medium text-zinc-400 hover:text-white transition-colors before:content-['•'] before:text-zinc-600 before:ml-2" @click="closeMobileMenu">
                          {{ child.name }}
                        </NuxtLink>
                      </li>
                    </ul>
                  </Transition>
                </li>
              </ul>
            </Transition>
          </li>

          <li>
            <NuxtLink to="/blog" class="mobile-link block py-3 text-lg font-bold text-zinc-200 border-b border-white/5" @click="closeMobileMenu">وبلاگ</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/about" class="mobile-link block py-3 text-lg font-bold text-zinc-200 border-b border-white/5" @click="closeMobileMenu">درباره ما</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/contact" class="mobile-link block py-3 text-lg font-bold text-zinc-200" @click="closeMobileMenu">تماس با ما</NuxtLink>
          </li>
        </ul>

        <div class="px-6 mt-4">
          <NuxtLink to="/quote" class="block w-full py-4 text-center bg-white text-black font-bold rounded-xl active:scale-95 transition-transform" @click="closeMobileMenu">
            ثبت سفارش / استعلام
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease-in-out;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease;
  max-height: 800px;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #84012B;
}
</style>