<script setup lang="ts">
definePageMeta({
  key: route => String(route.params.slug)
})

const route = useRoute()
const router = useRouter()

const isMobileFilterOpen = ref(false)
const showVat = useState<boolean>('show_vat_status', () => false)

const currentSlug = computed(() => {
  const slugParam = route.params.slug
  if (!slugParam) return null
  const slug = Array.isArray(slugParam) ? slugParam[slugParam.length - 1] : slugParam
  return slug ? decodeURIComponent(String(slug)) : null
})

const uniqueFetchKey = computed(() => `products-${currentSlug.value}-${JSON.stringify(route.query)}`)

const { data: pageData, pending } = await useFetch('/api/products', {
  key: uniqueFetchKey.value,
  query: computed(() => ({ categorySlug: currentSlug.value, ...route.query })),
  watch: [() => route.query] 
})

// === متغیرهای جدید برای آکاردئون و جستجوی داخلی فیلترها ===
// وضعیت باز/بسته بودن آکاردئون‌ها (آلیاژ و ضخامت پیش‌فرض باز هستند)
const openAccordions = ref<Record<string, boolean>>({
  alloy: true,
  thickness: true,
  size: false,
  surface: false
})

const toggleAccordion = (key: string) => {
  openAccordions.value[key] = !openAccordions.value[key]
}

// ذخیره متن جستجوی داخلی هر فیلتر
const filterSearchQueries = ref<Record<string, string>>({})

// تابع هوشمند برای فیلتر کردن گزینه‌های داخل یک آکاردئون
const getFilteredOptions = (key: string, options: string[]) => {
  const query = filterSearchQueries.value[key]
  if (!query) return options
  return options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()))
}
// ==========================================================

const visibleCount = ref(50) 
watch(() => pageData.value, () => {
  visibleCount.value = 50
})

const visibleProducts = computed(() => {
  if (!pageData.value?.products) return []
  return pageData.value.products.slice(0, visibleCount.value)
})

const hasMoreProducts = computed(() => {
  return (pageData.value?.products?.length || 0) > visibleCount.value
})

const loadMore = () => {
  visibleCount.value += 50
}

const selectedFilters = ref<Record<string, string[]>>({
  alloy: route.query.alloy ? String(route.query.alloy).split(',') : [],
  thickness: route.query.thickness ? String(route.query.thickness).split(',') : [],
  size: route.query.size ? String(route.query.size).split(',') : [],
  surface: route.query.surface ? String(route.query.surface).split(',') : [],
})

const applyFilters = async () => {
  const query: Record<string, string> = {}
  for (const [key, values] of Object.entries(selectedFilters.value)) {
    if (values.length > 0) query[key] = values.join(',')
  }
  await router.push({ path: route.path, query })
  isMobileFilterOpen.value = false
}

const formatPrice = (value: number) => new Intl.NumberFormat('fa-IR').format(Math.round(value))

const translateFilterKey = (key: string) => {
  const dictionary: Record<string, string> = {
    alloy: 'آلیاژ',
    thickness: 'ضخامت (میلی‌متر)',
    size: 'ابعاد',
    surface: 'کیفیت سطح'
  }
  return dictionary[key] || key
}

useSeoMeta({
  title: () => pageData.value?.categoryMetaTitle ? `قیمت روز ${pageData.value.categoryMetaTitle}` : 'قیمت روز آهن آلات',
  description: () => 'مشاهده لیست قیمت لحظه‌ای و خرید بدون واسطه از استیل مهفا.',
  ogTitle: () => pageData.value?.categoryMetaTitle ? `استیل مهفا | قیمت روز ${pageData.value.categoryMetaTitle}` : 'استیل مهفا | محصولات',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  robots: 'index, follow'
})

useHead({
  link: [{ rel: 'canonical', href: `https://steelmahfa.com${route.path}` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": pageData.value?.products?.map((prod: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": prod.name,
            "sku": prod.sku || `SM-${prod.id}`,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "IRR",
              "price": prod.price,
              "availability": "https://schema.org/InStock"
            }
          }
        })) || []
      })
    }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-[#84012B] selection:text-white pb-24 lg:pb-8">
    
    <header class="bg-[#0a0a0c] border-b border-white/5 pt-[90px] md:pt-[110px] pb-6 px-4 md:px-8">
      <div class="max-w-7xl mx-auto">
        <nav class="text-[10px] md:text-xs text-zinc-500 mb-3 md:mb-5 flex items-center gap-2 font-mono">
          <NuxtLink to="/" class="hover:text-white transition-colors">خانه</NuxtLink>
          <span>/</span>
          <NuxtLink to="/products" class="hover:text-white transition-colors">لیست قیمت</NuxtLink>
          <span v-if="pageData?.categoryName">/</span>
          <span v-if="pageData?.categoryName" class="text-zinc-300 truncate">{{ pageData.categoryName }}</span>
        </nav>

        <h1 class="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">
          {{ pageData?.categoryName ? `قیمت روز ${pageData.categoryName}` : 'محصولات و قیمت‌های لحظه‌ای' }}
        </h1>
        <p class="hidden md:block text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed mt-2">
          برای جستجوی سریع‌تر و یافتن دقیق محصول مورد نظر، از فیلترهای تعبیه شده استفاده کنید. تمامی قیمت‌ها به روز می‌باشند.
        </p>
      </div>
    </header>

    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 p-3 md:p-8">
      
      <aside 
        :class="[
          isMobileFilterOpen ? 'fixed inset-0 z-[100] bg-[#050505] flex flex-col' : 'hidden',
          'lg:flex lg:flex-col lg:col-span-3 lg:h-[calc(100vh-7rem)] lg:sticky lg:top-24 lg:pb-4'
        ]"
      >
        <div v-if="isMobileFilterOpen" class="flex items-center justify-between p-4 bg-[#0a0a0c] border-b border-white/10 shrink-0">
          <span class="font-bold text-white text-lg">فیلتر مشخصات</span>
          <button @click="isMobileFilterOpen = false" class="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="hidden lg:flex justify-between items-center mb-4 border-b border-white/5 pb-4 shrink-0 mt-2">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <svg class="w-4 h-4 text-[#84012B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            فیلتر پیشرفته
          </h2>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-0 lg:pr-2">
          <div v-if="pageData?.filters && Object.keys(pageData.filters).length > 0" class="space-y-3">
            
            <div v-for="(options, filterKey) in pageData.filters" :key="filterKey" class="bg-[#0c0c0e] lg:bg-transparent border border-white/5 lg:border-b lg:border-white/10 lg:border-x-0 lg:border-t-0 p-3 lg:p-0 lg:pb-3 rounded-lg lg:rounded-none">
                
                <button 
                  @click="toggleAccordion(filterKey)"
                  class="w-full flex justify-between items-center text-sm font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  {{ translateFilterKey(filterKey) }}
                  
                  <div class="flex items-center gap-2">
                    <span v-if="selectedFilters[filterKey]?.length > 0" class="bg-[#84012B] text-white text-[10px] px-1.5 py-0.5 rounded-md">
                      {{ selectedFilters[filterKey].length }} انتخاب
                    </span>
                    <svg 
                      class="w-4 h-4 text-zinc-500 transition-transform duration-300"
                      :class="openAccordions[filterKey] ? 'rotate-180' : ''"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <div 
                  v-show="openAccordions[filterKey]" 
                  class="mt-3 overflow-hidden transition-all duration-300"
                >
                  <div v-if="options.length > 6" class="mb-3 relative">
                    <input 
                      v-model="filterSearchQueries[filterKey]" 
                      type="text" 
                      :placeholder="`جستجوی ${translateFilterKey(filterKey)}...`" 
                      class="w-full bg-[#050505] border border-white/10 rounded-md py-2 px-3 pl-8 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                    <svg class="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <div class="flex flex-wrap gap-1.5">
                    <label 
                      v-for="opt in getFilteredOptions(filterKey, options)" 
                      :key="opt"
                      class="cursor-pointer border px-2.5 py-1.5 text-[11px] md:text-xs rounded transition-all duration-200 select-none flex-grow text-center"
                      :class="selectedFilters[filterKey]?.includes(opt) ? 'border-[#84012B] bg-[#84012B]/20 text-white font-bold' : 'border-white/10 bg-[#050505] text-zinc-400 hover:border-white/30 hover:text-zinc-200'"
                    >
                      <input type="checkbox" :value="opt" v-model="selectedFilters[filterKey]" class="hidden" />
                      {{ opt }}
                    </label>
                    <div v-if="getFilteredOptions(filterKey, options).length === 0" class="text-xs text-zinc-600 w-full text-center py-2">
                      موردی یافت نشد.
                    </div>
                  </div>
                </div>
              </div>
          </div>
          <div v-else class="text-zinc-500 text-sm flex items-center gap-2 mt-4 lg:mt-0">
            <svg class="animate-spin h-4 w-4 text-[#84012B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            در حال تحلیل ویژگی‌ها...
          </div>
        </div>

        <div class="p-4 bg-[#0a0a0c] border-t border-white/10 shrink-0 lg:p-0 lg:bg-transparent lg:border-none lg:mt-4">
          <button 
            @click="applyFilters"
            class="w-full bg-white text-black font-bold py-3.5 rounded-lg hover:bg-zinc-200 active:scale-95 transition-all text-sm md:text-base shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]"
          >
            مشاهده نتایج
          </button>
        </div>
      </aside>

      <main class="col-span-1 lg:col-span-9 flex flex-col gap-3">
         
         <div class="sticky top-[80px] z-40 flex justify-between items-center bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-xl shadow-lg">
            <div class="text-xs md:text-sm text-zinc-400 font-mono hidden sm:block">
              <span class="text-white font-bold">{{ pageData?.products?.length || 0 }}</span> ردیف قیمت
            </div>
            
            <div class="flex items-center justify-between w-full sm:w-auto gap-3 cursor-pointer select-none" @click="showVat = !showVat">
              <span class="text-[11px] md:text-sm font-medium transition-colors" :class="showVat ? 'text-amber-400 font-bold' : 'text-zinc-300'">
                محاسبه با ۱۰٪ ارزش افزوده
              </span>
              <div 
                class="relative inline-flex h-5 w-10 md:h-6 md:w-12 items-center rounded-full transition-colors duration-300 ease-in-out"
                :class="showVat ? 'bg-amber-500' : 'bg-zinc-700'"
              >
                <span 
                  class="inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white transition-transform duration-300 ease-in-out"
                  :class="showVat ? '-translate-x-5 md:-translate-x-6' : '-translate-x-1'"
                />
              </div>
            </div>
         </div>

         <div v-if="pending" class="space-y-2 mt-2">
            <div v-for="i in 6" :key="i" class="h-14 md:h-20 bg-white/5 animate-pulse rounded-lg"></div>
         </div>
         
         <div v-else-if="!pageData?.products || pageData.products.length === 0" class="flex flex-col items-center justify-center bg-[#0c0c0e] border border-white/5 rounded-xl py-16 px-4 text-center mt-2">
           <svg class="w-12 h-12 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           <h3 class="text-base font-bold text-white mb-1">محصولی با این مشخصات یافت نشد!</h3>
           <p class="text-xs text-zinc-400 max-w-sm">لطفاً فیلترهای انتخابی خود را تغییر دهید.</p>
         </div>

         <div v-else class="space-y-2 mt-2">
            <div class="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
               <div class="col-span-5">شرح محصول</div>
               <div class="col-span-3">مشخصات فنی</div>
               <div class="col-span-2 text-center">نوسان بازار</div>
               <div class="col-span-2 text-left">قیمت نهایی</div>
            </div>

            <article 
              v-for="product in visibleProducts" 
              :key="product.id"
              class="flex flex-row items-center justify-between md:grid md:grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 bg-[#0c0c0e] border border-white/5 rounded-lg hover:border-white/20 transition-colors"
            >
              <div class="flex flex-col justify-center w-2/3 md:w-auto md:col-span-5">
                <h3 class="text-zinc-100 font-bold text-[11px] md:text-sm leading-tight line-clamp-2 mb-1.5 md:mb-1">{{ product.name }}</h3>
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="text-[9px] md:text-[10px] text-zinc-500 font-mono">SKU: {{ product.sku || '-' }}</span>
                  <div class="flex items-center gap-1.5 md:hidden mt-0.5">
                    <span v-if="product.attributes?.thickness" class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] md:text-[10px] bg-white/5 text-zinc-400">
                      ضخامت: {{ product.attributes.thickness }}
                    </span>
                    <span v-if="product.attributes?.alloy" class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] md:text-[10px] bg-white/5 text-zinc-400">
                      آلیاژ: {{ product.attributes.alloy }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="hidden md:flex md:col-span-3 items-center flex-wrap gap-2">
                <span v-if="product.attributes?.thickness" class="inline-flex items-center px-2 py-1 rounded text-[10px] md:text-xs font-medium bg-zinc-800/50 text-zinc-300 border border-zinc-700/50">
                  ضخامت: {{ product.attributes.thickness }}
                </span>
                <span v-if="product.attributes?.alloy" class="inline-flex items-center px-2 py-1 rounded text-[10px] md:text-xs font-medium bg-zinc-800/50 text-zinc-300 border border-zinc-700/50">
                  آلیاژ: {{ product.attributes.alloy }}
                </span>
              </div>

              <div class="hidden md:flex md:col-span-2 items-center justify-center">
                <span 
                  v-if="product.trend !== 'stable'"
                  :class="product.trend === 'up' ? 'text-rose-500 bg-rose-500/10' : 'text-emerald-500 bg-emerald-500/10'"
                  class="px-2 py-0.5 rounded text-[10px] md:text-xs font-bold flex items-center gap-1"
                >
                  {{ product.trend === 'up' ? '▲' : '▼' }} {{ product.priceDiffPercentage }}%
                </span>
                <span 
                  v-else 
                  class="px-2 py-0.5 rounded text-[10px] md:text-xs font-bold flex items-center gap-1 text-zinc-500 bg-white/5"
                >
                  - ۰٪
                </span>
              </div>

              <div class="flex flex-col items-end justify-center w-1/3 md:w-auto md:col-span-2 pl-1 md:pl-0 shrink-0 border-l border-white/5 md:border-none">
                <span 
                  class="text-sm md:text-lg font-black block transition-colors duration-300"
                  :class="showVat ? 'text-amber-400' : 'text-white'"
                >
                  {{ formatPrice(showVat ? product.price * 1.1 : product.price) }}
                </span>
                <span class="text-[8px] md:text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5" :class="showVat ? 'text-amber-500/70 font-bold' : ''">
                  ریال / کیلوگرم
                </span>
              </div>
            </article>

            <div v-if="hasMoreProducts" class="flex justify-center mt-8 mb-4">
              <button 
                @click="loadMore" 
                class="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs md:text-sm font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-2 active:scale-95"
              >
                مشاهده ۵۰ محصول بعدی
                <span class="text-zinc-500 text-[10px] md:text-xs bg-black/30 px-2 py-1 rounded-md">
                  (مجموع: {{ pageData?.products?.length }})
                </span>
              </button>
            </div>
            
         </div>
      </main>

    </div>

    <div class="lg:hidden fixed bottom-0 inset-x-0 bg-[#0a0a0c]/95 backdrop-blur-md border-t border-white/10 p-3 z-40 flex items-center justify-center">
      <button 
        @click="isMobileFilterOpen = true"
        class="w-full max-w-sm bg-white text-black py-3 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-transform text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        فیلتر مشخصات و جستجو
      </button>
    </div>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
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
.select-none {
  user-select: none;
  -webkit-user-select: none;
}
</style>