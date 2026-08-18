<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  products: {
    type: Array,
    required: true,
    default: () => []
  }
})

// --- ستون‌های دینامیک ---
const hasThickness = computed(() => props.products.some(p => p.thickness))
const hasDimensions = computed(() => props.products.some(p => p.dimensions))
const hasOuterDiameter = computed(() => props.products.some(p => p.outer_diameter))
const hasFinishSurface = computed(() => props.products.some(p => p.finish_surface))
const hasCondition = computed(() => props.products.some(p => p.condition))
const hasScheduleStandard = computed(() => props.products.some(p => p.schedule_standard))
const hasBrand = computed(() => props.products.some(p => p.brand_origin))

// --- فیلترهای سایدبار (Extract Unique Values) ---
const availableFilters = computed(() => {
  const keys = ['thickness', 'dimensions', 'outer_diameter', 'schedule_standard', 'finish_surface', 'condition', 'brand_origin']
  const result = {}
  
  for (const k of keys) {
    const uniqueValues = [...new Set(props.products.map(p => p[k]).filter(Boolean))]
    if (uniqueValues.length > 0) {
      if (k === 'thickness' || k === 'outer_diameter') {
        uniqueValues.sort((a,b) => parseFloat(a) - parseFloat(b))
      } else {
        uniqueValues.sort()
      }
      result[k] = uniqueValues
    }
  }
  
  return result
})

const translateFilterKey = (key) => {
  const dict = {
    thickness: 'ضخامت (میلیمتر)',
    dimensions: 'ابعاد',
    outer_diameter: 'قطر خارجی',
    schedule_standard: 'رده',
    finish_surface: 'سطح پایانی',
    condition: 'حالت',
    brand_origin: 'برند سازنده'
  }
  return dict[key] || key
}

// State های انتخاب شده
const selectedFilters = ref({})

// وضعیت باز/بسته بودن آکاردئون‌ها و جستجوی داخلی
const openAccordions = ref({})
const filterSearchQueries = ref({})

const route = useRoute()
const router = useRouter()
const showVat = useState('show_vat_status', () => false)

// آماده‌سازی اولیه وضعیت فیلترها
watch(() => availableFilters.value, (filters) => {
  Object.keys(filters).forEach(key => {
    if (!selectedFilters.value[key]) {
      const queryVal = route.query[key]
      selectedFilters.value[key] = queryVal ? String(queryVal).split(',') : []
    }
    if (openAccordions.value[key] === undefined) openAccordions.value[key] = true
    if (filterSearchQueries.value[key] === undefined) filterSearchQueries.value[key] = ''
  })
}, { immediate: true })

watch(selectedFilters, (newFilters) => {
  const query = { ...route.query }
  let changed = false
  Object.keys(newFilters).forEach(key => {
    const vals = newFilters[key]
    if (vals && vals.length > 0) {
      const joined = vals.join(',')
      if (query[key] !== joined) {
        query[key] = joined
        changed = true
      }
    } else {
      if (query[key]) {
        delete query[key]
        changed = true
      }
    }
  })
  if (changed) {
    router.replace({ query })
  }
}, { deep: true })

const hasActiveFilters = computed(() => {
  return Object.values(selectedFilters.value).some(vals => vals && vals.length > 0)
})

const removeFilter = (key, val) => {
  if (selectedFilters.value[key]) {
    selectedFilters.value[key] = selectedFilters.value[key].filter(v => v !== val)
  }
}

const clearAllFilters = () => {
  Object.keys(selectedFilters.value).forEach(key => {
    selectedFilters.value[key] = []
  })
}

const toggleAccordion = (key) => { openAccordions.value[key] = !openAccordions.value[key] }

const getFilteredOptions = (filterKey, options) => {
  const q = filterSearchQueries.value[filterKey]
  if (!q) return options
  return options.filter(opt => String(opt).toLowerCase().includes(q.toLowerCase()))
}

// موبایل فیلتر
const isMobileFilterOpen = ref(false)

// --- جستجو و فیلترینگ ---
const searchQuery = ref('')
const visibleCount = ref(50) // جایگزین pagination

const filteredProducts = computed(() => {
  let result = props.products

  // جستجوی متنی
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => {
      const matchThick = p.thickness ? String(p.thickness).toLowerCase().includes(q) : false
      const matchDim = p.dimensions ? String(p.dimensions).toLowerCase().includes(q) : false
      const matchOuter = p.outer_diameter ? String(p.outer_diameter).toLowerCase().includes(q) : false
      const matchFinish = p.finish_surface ? String(p.finish_surface).toLowerCase().includes(q) : false
      const matchCond = p.condition ? String(p.condition).toLowerCase().includes(q) : false
      const matchSched = p.schedule_standard ? String(p.schedule_standard).toLowerCase().includes(q) : false
      const matchBrand = p.brand_origin ? String(p.brand_origin).toLowerCase().includes(q) : false
      return matchThick || matchDim || matchFinish || matchBrand || matchOuter || matchCond || matchSched
    })
  }

  // فیلترهای دینامیک
  for (const [key, selectedValues] of Object.entries(selectedFilters.value)) {
    if (selectedValues && selectedValues.length > 0) {
      result = result.filter(p => selectedValues.includes(p[key]))
    }
  }

  return result
})

// ریسِت کردن نمایش در صورت تغییر جستجو یا فیلترها
watch([searchQuery, selectedFilters], () => {
  visibleCount.value = 50
}, { deep: true })

const loadMore = () => {
  visibleCount.value += 50
}

const slicedProducts = computed(() => filteredProducts.value.slice(0, visibleCount.value))

// --- Smart Table Grouping ---
const groupedProducts = computed(() => {
  const groups = {}
  slicedProducts.value.forEach(p => {
    // اولویت گروه‌بندی: زیردسته -> ضخامت -> قطر خارجی -> ابعاد
    let groupKey = 'سایر موارد'
    if (p.subcategory_title) {
      groupKey = p.subcategory_title
    } else if (p.thickness) {
      groupKey = `ضخامت: ${p.thickness} میلیمتر`
    } else if (p.outer_diameter) {
      groupKey = `قطر: ${p.outer_diameter}`
    } else if (p.dimensions) {
      groupKey = `ابعاد: ${p.dimensions}`
    }

    if (!groups[groupKey]) groups[groupKey] = []
    groups[groupKey].push(p)
  })
  return groups
})

// --- محاسبه تاریخ آخرین بروزرسانی کل جدول ---
const lastUpdated = computed(() => {
  let latest = 0
  props.products.forEach(p => {
    const history = p.price_history || []
    if (history.length > 0) {
      const dt = new Date(history[0].date_created).getTime()
      if (dt > latest) latest = dt
    }
  })
  if (latest === 0) return null
  return new Date(latest).toLocaleDateString('fa-IR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
})

const getLatestPriceRecord = (product) => {
  if (!product.price_history || product.price_history.length === 0) return null
  return product.price_history[0] 
}

const needsCallForPrice = (product) => {
  const record = getLatestPriceRecord(product)
  if (!record) return true
  return record.is_call_for_price || !record.price || record.price === 0
}

const formatPrice = (price) => {
  if (!price) return '-'
  return new Intl.NumberFormat('fa-IR').format(price)
}

// --- منطق مدال نمودار قیمت ---
const isChartModalOpen = ref(false)
const selectedProduct = ref(null)

const openChart = (product) => {
  selectedProduct.value = product
  isChartModalOpen.value = true
}

const closeChart = () => {
  isChartModalOpen.value = false
  setTimeout(() => { selectedProduct.value = null }, 300)
}

const sparklinePoints = computed(() => {
  if (!selectedProduct.value || !selectedProduct.value.price_history) return ''
  const history = [...selectedProduct.value.price_history].reverse()
  if (history.length < 2) return ''
  const prices = history.map(h => h.price || 0)
  const max = Math.max(...prices)
  const min = Math.min(...prices)
  const width = 300
  const height = 100
  const padding = 20
  const stepX = (width - padding * 2) / (prices.length - 1)
  const rangeY = max - min || 1
  return prices.map((price, index) => {
    const x = padding + (index * stepX)
    const y = height - padding - (((price - min) / rangeY) * (height - padding * 2))
    return `${x},${y}`
  }).join(' ')
})
</script>

<template>
  <div class="relative z-10 flex flex-col md:flex-row gap-6 mx-auto justify-center">
    
    <!-- Mobile Sticky Filter CTA -->
    <aside 
        :class="[
          isMobileFilterOpen ? 'fixed inset-0 z-[100] bg-[#050505] flex flex-col' : 'hidden',
          'w-full md:w-1/3 lg:w-1/4 xl:w-1/5 shrink-0 lg:flex lg:flex-col lg:h-[calc(100vh-7rem)] lg:sticky lg:top-24 lg:pb-4'
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
          <div v-if="Object.keys(availableFilters).length > 0" class="space-y-3">
            
            <div v-for="(options, filterKey) in availableFilters" :key="filterKey" class="bg-[#0c0c0e] lg:bg-transparent border border-white/5 lg:border-b lg:border-white/10 lg:border-x-0 lg:border-t-0 p-3 lg:p-0 lg:pb-3 rounded-lg lg:rounded-none">
                
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
            در حال بررسی مشخصات...
          </div>
        </div>

        <div class="p-4 bg-[#0a0a0c] border-t border-white/10 shrink-0 lg:p-0 lg:bg-transparent lg:border-none lg:mt-4">
          <button 
            @click="isMobileFilterOpen = false"
            class="w-full bg-white text-black font-bold py-3.5 rounded-lg hover:bg-zinc-200 active:scale-95 transition-all text-sm md:text-base shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]"
          >
            مشاهده نتایج
          </button>
        </div>
      </aside>
      <div class="lg:hidden fixed bottom-0 inset-x-0 bg-[#0a0a0c]/95 backdrop-blur-md border-t border-white/10 p-3 z-40 flex items-center justify-center">
        <button 
          @click="isMobileFilterOpen = true"
          class="w-full max-w-sm bg-white text-black py-3 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-transform text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          فیلتر مشخصات و جستجو
        </button>
      </div>

    <!-- Main Content Area -->
    <div class="flex-1 max-w-4xl bg-[#08080a] rounded-2xl border border-zinc-800 p-4 md:p-6 shadow-xl relative">
      
      <!-- Sticky Active Filters & VAT Bar -->
      <div class="sticky top-[75px] z-40 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-xl shadow-lg mb-6 gap-4">
        <!-- Active Filters -->
        <div class="flex-1 flex flex-wrap gap-2 items-center w-full">
          <span class="text-xs text-zinc-500 font-bold ml-1">فیلتر فعال:</span>
          <template v-for="(values, key) in selectedFilters" :key="'active-'+key">
            <span 
              v-for="val in values" 
              :key="'active-'+key+'-'+val"
              class="inline-flex items-center gap-1.5 bg-[#84012B]/20 text-white text-xs px-2 py-1 rounded-md border border-[#84012B]/40"
            >
              {{ val }}
              <button @click="removeFilter(key, val)" class="text-zinc-400 hover:text-white transition-colors">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </span>
          </template>
          <span v-if="!hasActiveFilters" class="text-xs text-zinc-600">نداریم</span>
          <button v-if="hasActiveFilters" @click="clearAllFilters" class="text-xs text-[#ff477e] hover:text-white transition-colors mr-1 font-bold">
            حذف همه
          </button>
        </div>
        <!-- VAT Toggle -->
        <div class="shrink-0 flex items-center justify-between md:justify-end gap-3 cursor-pointer select-none border-t md:border-t-0 md:border-r border-white/10 pt-3 md:pt-0 md:pr-4 w-full md:w-auto" @click="showVat = !showVat">
          <span class="text-[11px] md:text-sm font-medium transition-colors" :class="showVat ? 'text-amber-400 font-bold' : 'text-zinc-300'">
            ارزش افزوده (۱۰٪)
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

      <!-- Header & Search -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 class="text-xl font-bold text-white flex items-center gap-2 shrink-0">
          <span class="w-1.5 h-6 bg-[#84012B] rounded-full inline-block"></span>
          جدول ابعاد و قیمت روز
        </h2>
        
        <div class="relative w-full md:max-w-xs">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="جستجوی سریع..." 
            class="w-full bg-zinc-900/50 border border-zinc-700/50 text-white text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-[#84012B]/50 transition-colors"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-3 top-2.5 w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>

        <div v-if="lastUpdated" class="text-sm text-zinc-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hidden lg:flex items-center gap-2 shrink-0">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          بروزرسانی: امروز
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredProducts.length === 0" class="py-12 text-center text-zinc-500 bg-zinc-900/20 rounded-xl border border-zinc-800">
        محصولی با این مشخصات یافت نشد.
      </div>

      <!-- DUAL-DOM STRATEGY -->

      <!-- 1. DESKTOP VIEW (Strict Table) -->
      <div v-if="filteredProducts.length > 0" class="hidden md:block overflow-x-auto rounded-xl border border-zinc-800 custom-scrollbar relative">
        <table class="w-full text-right text-sm text-zinc-300 whitespace-nowrap">
          <thead class="text-xs text-zinc-400 bg-zinc-900/50 uppercase border-b border-zinc-800">
            <tr>
              <th v-if="hasThickness" class="px-4 py-4 font-semibold">ضخامت</th>
              <th v-if="hasDimensions" class="px-4 py-4 font-semibold">ابعاد</th>
              <th v-if="hasOuterDiameter" class="px-4 py-4 font-semibold">قطر خارجی</th>
              <th v-if="hasScheduleStandard" class="px-4 py-4 font-semibold">رده</th>
              <th v-if="hasFinishSurface" class="px-4 py-4 font-semibold">سطح</th>
              <th v-if="hasCondition" class="px-4 py-4 font-semibold">حالت</th>
              <th v-if="hasBrand" class="px-4 py-4 font-semibold">برند / سازنده</th>
              <th class="px-4 py-4 font-semibold text-left">قیمت (تومان)</th>
              <th class="px-4 py-4 font-semibold text-center">اقدام</th>
            </tr>
          </thead>
          <tbody v-for="(items, groupName) in groupedProducts" :key="'desk-'+groupName" class="bg-[#08080a]">
            <!-- Group Header (Sticky) -->
            <tr class="bg-zinc-900/90 backdrop-blur sticky top-0 z-10 border-y border-zinc-700/50 shadow-sm">
              <td :colspan="10" class="px-4 py-2 text-[#ff477e] font-black text-sm">{{ groupName }}</td>
            </tr>
            <!-- Rows -->
            <tr v-for="product in items" :key="product.id" class="hover:bg-white/5 transition-colors group border-b border-zinc-800/30 last:border-b-0">
              <td v-if="hasThickness" class="px-4 py-3">{{ product.thickness || '-' }}</td>
              <td v-if="hasDimensions" class="px-4 py-3 font-mono font-bold tracking-widest">{{ product.dimensions || '-' }}</td>
              <td v-if="hasOuterDiameter" class="px-4 py-3">{{ product.outer_diameter || '-' }}</td>
              <td v-if="hasScheduleStandard" class="px-4 py-3">{{ product.schedule_standard || '-' }}</td>
              <td v-if="hasFinishSurface" class="px-4 py-3 text-xs">{{ product.finish_surface || '-' }}</td>
              <td v-if="hasCondition" class="px-4 py-3 text-xs">{{ product.condition || '-' }}</td>
              <td v-if="hasBrand" class="px-4 py-3 text-zinc-400 text-xs">{{ product.brand_origin || '-' }}</td>
              
              <td class="px-4 py-3 text-left">
                <div class="flex items-center justify-end gap-3">
                  <template v-if="needsCallForPrice(product)">
                    <a href="tel:02112345678" class="text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded border border-yellow-500/20 text-xs font-bold hover:bg-yellow-500 hover:text-black transition-colors inline-flex items-center gap-1">
                      <span class="iconify lucide--phone text-xs"></span>
                      استعلامی
                    </a>
                  </template>
                  <template v-else>
                    <div class="flex flex-col items-end">
                      <span class="text-base font-bold transition-colors" :class="showVat ? 'text-amber-400' : 'text-white'">
                        {{ formatPrice(showVat ? getLatestPriceRecord(product).price * 1.1 : getLatestPriceRecord(product).price) }}
                        <span v-if="getLatestPriceRecord(product).unit" class="text-xs font-normal mr-1" :class="showVat ? 'text-amber-500/70' : 'text-zinc-500'">/ {{ getLatestPriceRecord(product).unit }}</span>
                      </span>
                      <span v-if="showVat" class="text-[9px] md:text-[10px] text-amber-500/70 uppercase tracking-wider mt-0.5 font-bold">با احتساب مالیات</span>
                    </div>
                  </template>
                  
                  <button 
                    v-if="product.price_history && product.price_history.length > 1"
                    @click="openChart(product)"
                    class="text-zinc-500 hover:text-[#ff477e] transition-colors p-1 rounded-md hover:bg-[#84012B]/20"
                    title="نمودار تغییرات قیمت"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  </button>
                </div>
              </td>

              <td class="px-4 py-3 text-center">
                <a href="tel:02112345678" class="inline-flex items-center justify-center bg-zinc-800 group-hover:bg-[#84012B] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-[#84012B]/20">
                  تماس
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. MOBILE VIEW (Card Layout) -->
      <div v-if="filteredProducts.length > 0" class="md:hidden flex flex-col gap-6">
        <div v-for="(items, groupName) in groupedProducts" :key="'mob-'+groupName" class="flex flex-col gap-3">
          
          <!-- Mobile Group Header (Sticky) -->
          <div class="bg-zinc-900/90 backdrop-blur text-[#ff477e] px-4 py-2.5 font-black text-sm rounded-lg border border-zinc-800 shadow-sm sticky top-0 z-10 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            {{ groupName }}
          </div>
          
          <!-- Mobile Cards -->
          <article v-for="product in items" :key="'mob-card-'+product.id" class="group relative flex flex-col gap-3 p-4 bg-[#0a0a0c]/80 border border-zinc-800 rounded-xl hover:border-[#84012B]/50 transition-colors shadow-lg">
             <div class="flex justify-between items-start">
               <div>
                  <h3 class="text-white font-bold text-lg font-mono tracking-widest flex items-center gap-2">
                    {{ product.dimensions || product.outer_diameter || product.thickness || 'بدون ابعاد' }}
                  </h3>
                  <p class="text-zinc-400 text-xs mt-1.5 flex gap-2 items-center">
                    <span v-if="product.brand_origin" class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {{ product.brand_origin }}
                    </span>
                    <span v-if="product.condition">| {{ product.condition }}</span>
                  </p>
               </div>
               <span v-if="product.finish_surface" class="bg-zinc-900 text-xs px-2 py-1.5 rounded-md text-zinc-300 border border-zinc-800 font-medium">{{ product.finish_surface }}</span>
             </div>
             
             <div class="flex justify-between items-center mt-2 pt-3 border-t border-zinc-800/50">
                <div class="text-left">
                   <template v-if="needsCallForPrice(product)">
                      <a href="tel:02112345678" class="text-yellow-500 font-bold text-sm bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">استعلام تلفنی</a>
                   </template>
                   <template v-else>
                      <div class="font-black text-xl tracking-tight transition-colors" :class="showVat ? 'text-amber-400' : 'text-white'">
                        {{ formatPrice(showVat ? getLatestPriceRecord(product).price * 1.1 : getLatestPriceRecord(product).price) }}
                      </div>
                      <div class="text-[10px] mt-0.5 transition-colors" :class="showVat ? 'text-amber-500/70' : 'text-zinc-500'">
                        تومان / {{ getLatestPriceRecord(product).unit }} <span v-if="showVat" class="font-bold">(با مالیات)</span>
                      </div>
                   </template>
                </div>
                
                <div class="flex gap-2">
                  <button @click="openChart(product)" v-if="product.price_history && product.price_history.length > 1" class="text-zinc-400 hover:text-[#ff477e] bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  </button>
                  <a href="tel:02112345678" class="flex items-center justify-center bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform border border-zinc-700">تماس</a>
                </div>
             </div>
          </article>
        </div>
      </div>

      <!-- Load More Action -->
      <div v-if="filteredProducts.length > visibleCount" class="mt-8 text-center flex flex-col items-center gap-3">
        <p class="text-xs text-zinc-500">
          در حال نمایش {{ visibleCount }} مورد از {{ filteredProducts.length }} محصول
        </p>
        <button 
          @click="loadMore"
          class="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          مشاهده موارد بیشتر
        </button>
      </div>
      
      <!-- Quick CTA Box at bottom -->
      <div class="mt-10 p-5 rounded-xl bg-gradient-to-r from-[#84012B]/20 via-[#84012B]/5 to-transparent border border-[#84012B]/30 hidden lg:flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-right">
          <h3 class="text-white font-black text-lg mb-1">نیاز به ابعاد یا خدمات خاصی دارید؟</h3>
          <p class="text-zinc-400 text-sm">کارشناسان ما آماده ارائه مشاوره رایگان و ارسال پیش‌فاکتور رسمی هستند.</p>
        </div>
        <a href="tel:02112345678" class="bg-white text-[#050505] hover:bg-zinc-200 px-6 py-3 rounded-xl font-black transition-colors whitespace-nowrap shadow-xl">
          تماس با کارشناس فروش
        </a>
      </div>
      
    </div>

    <!-- Modal for Sparkline Chart -->
    <Teleport to="body">
      <div v-if="isChartModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeChart"></div>
        
        <div class="relative w-full max-w-lg bg-[#0a0a0c] border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-fade-in-up">
          <button @click="closeChart" class="absolute top-4 left-4 text-zinc-500 hover:text-white bg-zinc-900 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <h3 class="text-white font-bold text-lg mb-2 text-right">روند تغییرات قیمت</h3>
          <p v-if="selectedProduct" class="text-zinc-400 text-sm mb-6 pb-4 border-b border-zinc-800/50 text-right">
            <span v-if="selectedProduct.thickness">ضخامت {{ selectedProduct.thickness }} | </span>
            <span v-if="selectedProduct.dimensions">{{ selectedProduct.dimensions }}</span>
          </p>
          
          <div v-if="sparklinePoints" class="relative w-full h-[150px] bg-zinc-900/30 rounded-xl border border-zinc-800 p-4">
            <svg viewBox="0 0 300 100" class="w-full h-full overflow-visible">
              <line x1="0" y1="50" x2="300" y2="50" stroke="#3f3f46" stroke-dasharray="4" stroke-width="0.5"/>
              <polyline 
                :points="sparklinePoints"
                fill="none" 
                stroke="#ff477e" 
                stroke-width="3" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                class="drop-shadow-[0_0_8px_rgba(255,71,126,0.5)]"
              />
              <circle 
                v-for="(point, idx) in sparklinePoints.split(' ')" 
                :key="idx"
                :cx="point.split(',')[0]" 
                :cy="point.split(',')[1]" 
                r="4" 
                fill="#050505"
                stroke="#ff477e"
                stroke-width="2"
              />
            </svg>
            <div class="flex justify-between mt-0 text-[10px] text-zinc-500 px-2">
              <span>قدیمی‌تر</span>
              <span>جدیدترین</span>
            </div>
          </div>
          
          <div v-else class="text-center py-10 text-zinc-500">
            اطلاعات کافی برای رسم نمودار وجود ندارد.
          </div>
        </div>
      </div>
    </Teleport>
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

.animate-fade-in-up {
  animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
