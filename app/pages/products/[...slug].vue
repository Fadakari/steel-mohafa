<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const isMobileFilterOpen = ref(false)
const showVat = useState<boolean>('show_vat_status', () => false)

// واکنش‌گرا کردن اسلاگ برای مسیرهای تودرتو (مثل /products/ورق-استیل/ورق-استیل-310s)
const currentSlug = computed(() => {
  const slugArray = route.params.slug as string[]
  return slugArray && slugArray.length > 0 
    ? decodeURIComponent(slugArray[slugArray.length - 1]) 
    : null
})

// گوش دادن قدرتمند به تغییرات مسیر و فیلترها
const { data: pageData, pending } = await useFetch('/api/products', {
  query: computed(() => ({ categorySlug: currentSlug.value, ...route.query })),
  watch: [() => route.query, () => route.params.slug] 
})

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
  link: [
    { rel: 'canonical', href: `https://steelmahfa.com${route.path}` }
  ],
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
  <div class="min-h-screen bg-[#050505] text-white font-mono selection:bg-[#84012B] selection:text-white">
    
    <header class="border-b border-white/5 bg-[#09090b] px-6 py-12 mt-20">
      <div class="container mx-auto">
        <h1 class="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          {{ pageData?.categoryName || 'محصولات و قیمت‌های لحظه‌ای' }}
        </h1>
        <p class="text-zinc-400 text-sm max-w-2xl">
          برای یافتن محصول مورد نظر، از پنل فیلتر پیشرفته استفاده کنید.
        </p>
      </div>
    </header>

    <div class="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      
      <button 
        @click="isMobileFilterOpen = true"
        class="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#84012B] text-white px-8 py-3 font-bold tracking-widest shadow-[4px_4px_0_0_rgba(255,255,255,0.1)] active:translate-x-[2px] active:translate-y-[2px] transition-all"
      >
        فیلتر پیشرفته
      </button>

      <aside 
        :class="isMobileFilterOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'"
        class="fixed inset-x-0 bottom-0 z-50 h-[80vh] bg-[#09090b] border-t border-white/10 p-6 transition-transform duration-300 ease-in-out lg:static lg:block lg:col-span-1 lg:h-fit lg:border lg:border-white/5 lg:top-6 overflow-y-auto custom-scrollbar"
      >
        <div class="flex justify-between items-center mb-6 lg:mb-4 border-b border-white/10 pb-4">
          <h2 class="text-xl font-bold">ویژگی‌های محصول</h2>
          <button @click="isMobileFilterOpen = false" class="lg:hidden text-zinc-400 text-3xl hover:text-white">&times;</button>
        </div>

        <div v-if="pageData?.filters && Object.keys(pageData.filters).length > 0" class="space-y-6">
          <div v-for="(options, filterKey) in pageData.filters" :key="filterKey">
              <h3 class="text-sm font-bold text-zinc-400 mb-3">{{ translateFilterKey(filterKey) }}</h3>
              <div class="flex flex-wrap gap-2">
                <label 
                  v-for="opt in options" 
                  :key="opt"
                  class="cursor-pointer border px-3 py-1 text-xs transition-colors"
                  :class="selectedFilters[filterKey]?.includes(opt) ? 'border-[#84012B] bg-[#84012B]/10 text-white' : 'border-white/10 bg-[#050505] text-zinc-300 hover:border-white/30'"
                >
                  <input type="checkbox" :value="opt" v-model="selectedFilters[filterKey]" class="hidden" />
                  {{ opt }}
                </label>
              </div>
            </div>
            
            <button 
              @click="applyFilters"
              class="w-full mt-8 bg-white text-black font-bold py-3 hover:bg-zinc-200 active:translate-y-[2px] active:translate-x-[2px] shadow-[4px_4px_0_0_#84012B] transition-all"
            >
              اعمال فیلترها
            </button>
        </div>
        <div v-else class="text-zinc-500 text-sm animate-pulse">در حال تحلیل ویژگی‌ها...</div>
      </aside>

      <main class="col-span-1 lg:col-span-3 space-y-6">
         
         <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-white/10 bg-[#09090b] p-4 gap-4">
            <span class="text-sm text-zinc-400">محاسبه و نمایش قیمت‌ها با احتساب ۱۰٪ مالیات بر ارزش افزوده</span>
            <button 
              @click="showVat = !showVat"
              :class="showVat ? 'bg-[#84012B] text-white border-[#84012B]' : 'bg-transparent text-zinc-500 border-white/10'"
              class="border px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all active:translate-x-[2px] active:translate-y-[2px]"
            >
              {{ showVat ? 'فعال' : 'غیرفعال' }}
            </button>
         </div>

         <div v-if="pending" class="space-y-2">
            <div v-for="i in 5" :key="i" class="h-24 bg-white/5 animate-pulse border border-white/5"></div>
         </div>
         
         <div v-else-if="!pageData?.products || pageData.products.length === 0" class="border border-white/5 bg-[#09090b] p-12 text-center text-zinc-500">
           محصولی با این ویژگی‌ها یافت نشد. لطفاً فیلترها را تغییر دهید.
         </div>

         <div v-else class="space-y-2">
            <div 
              v-for="product in pageData.products" 
              :key="product.id"
              class="flex flex-col md:flex-row md:items-center justify-between border border-white/5 bg-[#09090b] p-4 hover:border-white/20 transition-colors gap-4"
            >
              <div class="flex-1">
                <h3 class="text-white font-bold text-sm md:text-base leading-relaxed">{{ product.name }}</h3>
                <div class="flex items-center gap-4 mt-2">
                  <span class="text-xs text-zinc-500 bg-white/5 px-2 py-1">SKU: {{ product.sku || 'N/A' }}</span>
                  <span v-if="product.attributes?.thickness" class="text-xs text-zinc-400">ضخامت: {{ product.attributes.thickness }}</span>
                  <span v-if="product.attributes?.alloy" class="text-xs text-zinc-400">آلیاژ: {{ product.attributes.alloy }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between md:justify-end gap-6 md:min-w-[200px]">
                
                <span 
                  v-if="product.trend !== 'stable'"
                  :class="product.trend === 'up' ? 'text-rose-500' : 'text-emerald-500'"
                  class="text-xs font-bold flex items-center gap-1"
                >
                  {{ product.trend === 'up' ? '▲' : '▼' }} {{ product.priceDiffPercentage }}%
                </span>
                <span v-else class="text-xs text-zinc-600">-</span>

                <div class="text-right">
                  <span class="text-lg md:text-xl font-bold text-white block">
                    {{ formatPrice(showVat ? product.price * 1.1 : product.price) }}
                  </span>
                  <span class="text-[10px] text-zinc-500 block uppercase tracking-widest mt-1">ریال / کیلوگرم</span>
                </div>
              </div>

            </div>
         </div>
      </main>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #050505;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #27272a;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #84012B;
}
</style>