<script setup>
definePageMeta({
  key: route => String(route.params.slug)
})

const route = useRoute()
const currentSlug = computed(() => {
  const slugParam = route.params.slug
  if (!slugParam) return null
  const slug = Array.isArray(slugParam) ? slugParam[slugParam.length - 1] : slugParam
  return slug ? decodeURIComponent(String(slug)) : null
})

const fullSlugPath = computed(() => {
  const slugParam = route.params.slug
  if (!slugParam) return ''
  return Array.isArray(slugParam) ? slugParam.map(s => encodeURIComponent(s)).join('/') : encodeURIComponent(String(slugParam))
})

// SEO & Content State
const isSeoTextExpanded = ref(false)
const activeFaq = ref(0)
const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? -1 : index
}

// Placeholder structure for SEO content, to be filled by the user later
const categorySeoContent = {
  default: {
    title: '',
    content: `در این بخش می‌توانید لیست کامل محصولات و مشخصات فنی آن‌ها را به همراه قیمت لحظه‌ای مشاهده کنید. تمامی محصولات با ضمانت کیفیت و سرتیفیکیت معتبر ارائه می‌شوند. جهت دریافت مشاوره تخصصی و ثبت سفارش قطعی با کارشناسان فروش استیل مهفا در ارتباط باشید.`,
    faqs: [
      { q: 'چگونه می‌توانم اصالت و کیفیت محصولات را بررسی کنم؟', a: 'تمامی مقاطع استیل در مجموعه مهفا همراه با سرتیفیکیت معتبر (شناسنامه متالورژی) و به شرط آنالیز در آزمایشگاه‌های مرجع به فروش می‌رسند.' },
      { q: 'آیا امکان ارسال بار به شهرستان وجود دارد؟', a: 'بله، استیل مهفا با معتبرترین باربری‌های صنعتی قرارداد دارد و محموله شما با بیمه‌نامه معتبر به تمامی نقاط ایران ارسال می‌شود.' }
    ],
    links: [
      { text: 'قیمت ورق استیل', url: '/category/ورق-استیل' },
      { text: 'قیمت لوله استیل', url: '/category/لوله-استیل' },
      { text: 'قیمت میلگرد استیل', url: '/category/میلگرد-استیل' }
    ]
  }
}

const currentSeoData = computed(() => {
  if (!currentSlug.value) return categorySeoContent['default']
  return categorySeoContent[currentSlug.value] || categorySeoContent['default']
})

// واکشی دیتا از طریق سرور API که در مرحله قبل ساختیم
const { data: categoryData, pending, error } = await useFetch(() => `/api/category/${fullSlugPath.value}`, {
  key: `category-${fullSlugPath.value}`
})

// تنظیم متادیتاها برای سئو (استفاده از مقادیر پیش‌فرض در صورت خالی بودن دیتابیس)
if (categoryData.value) {
  const pageTitle = currentSeoData.value.title || categoryData.value.SEO_meta?.title || `قیمت روز و خرید ${categoryData.value.title}`
  const pageDescription = categoryData.value.SEO_meta?.description || `جداول قیمتی و مشخصات فیزیکی ${categoryData.value.title}. بروزرسانی لحظه‌ای قیمت‌ها.`
  
  useSeoMeta({
    title: `${pageTitle} | استیل مهفا`,
    description: pageDescription,
    ogTitle: `${pageTitle} | استیل مهفا`,
    ogDescription: pageDescription,
    ogType: 'website',
  })
} else if (!pending.value && error.value) {
  // مدیریت خطای 404 اگر دسته‌بندی یافت نشد
  throw createError({ statusCode: 404, statusMessage: 'دسته‌بندی مورد نظر یافت نشد' })
}

// تولید اسکیمای Breadcrumb
const breadcrumbs = computed(() => {
  const paths = [
    { name: 'خانه', url: 'https://mohafa.com/' }
  ]
  if (categoryData.value) {
    if (categoryData.value.parent) {
      paths.push({
        name: categoryData.value.parent.title,
        url: `https://mohafa.com/category/${categoryData.value.parent.slug}`
      })
    }
    paths.push({
      name: categoryData.value.title,
      url: `https://mohafa.com/category/${currentSlug.value}`
    })
  }
  return paths
})

// تولید اسکیمای قیمت (AggregateOffer)
const aggregateOfferSchema = computed(() => {
  if (!categoryData.value || !categoryData.value.products || categoryData.value.products.length === 0) return null
  
  const prices = categoryData.value.products.map(p => p.price).filter(p => p > 0)
  if (prices.length === 0) return null
  
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": currentSeoData.value.title || categoryData.value.title,
    "description": categoryData.value.SEO_meta?.description || '',
    "offers": {
      "@type": "AggregateOffer",
      "offerCount": prices.length,
      "lowPrice": minPrice,
      "highPrice": maxPrice,
      "priceCurrency": "IRR"
    }
  }
})

// اعمال متادیتاها و اسکیماها در هدر سایت
useHead(() => {
  const schemas = []
  
  schemas.push({
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.value.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    })
  })

  if (aggregateOfferSchema.value) {
    schemas.push({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(aggregateOfferSchema.value)
    })
  }

  if (currentSeoData.value.faqs && currentSeoData.value.faqs.length > 0) {
    schemas.push({
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": currentSeoData.value.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      })
    })
  }

  return {
    script: schemas
  }
})
</script>

<template>
  <main class="pt-32 pb-32 md:pb-24 max-w-[100%] mx-auto px-4 md:px-6 min-h-[70vh] selection:bg-[#84012b7a]">
    <!-- حالت در حال بارگذاری -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-20 text-zinc-400">
      <span class="w-10 h-10 border-4 border-[#84012B] border-t-transparent rounded-full animate-spin mb-4"></span>
      در حال دریافت اطلاعات آخرین قیمت‌ها...
    </div>
    
    <!-- حالت خطا -->
    <div v-else-if="error" class="text-center py-20 bg-red-500/10 rounded-2xl border border-red-500/20">
      <h2 class="text-xl font-bold text-red-400 mb-2">متاسفانه خطایی رخ داد!</h2>
      <p class="text-zinc-400">امکان دریافت اطلاعات این دسته‌بندی در حال حاضر وجود ندارد.</p>
    </div>
    
    <!-- محتوای اصلی صفحه -->
    <div v-else-if="categoryData">
      <!-- Title & Breadcrumb (Upgraded Header) -->
      <div class="mb-10 pb-6 border-b border-zinc-800 relative w-[80%] mx-auto">
        <div class="absolute left-0 top-0 w-1 h-full bg-[#84012B] hidden md:block"></div>
        <div class="md:pl-6">
          <nav aria-label="Breadcrumb" class="mb-4">
            <ol class="flex flex-wrap items-center gap-2 text-xs md:text-sm font-mono text-zinc-500">
              <li class="flex items-center gap-2">
                <NuxtLink to="/" class="hover:text-white transition-colors flex items-center gap-1">
                  <span class="w-1.5 h-1.5 bg-zinc-600 rounded-full inline-block"></span>
                  خانه
                </NuxtLink>
                <span class="text-zinc-700">/</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-[#ff477e] font-bold">{{ categoryData.title }}</span>
              </li>
            </ol>
          </nav>

          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-2">
            <div>
              <h1 class="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">
                {{ currentSeoData.title || categoryData.SEO_meta?.title || categoryData.title }}
              </h1>
              <p class="text-zinc-400 text-sm max-w-2xl leading-relaxed text-justify">
                {{ categoryData.SEO_meta?.description || 'در این بخش می‌توانید لیست کامل محصولات و مشخصات فنی آن‌ها را به همراه قیمت لحظه‌ای مشاهده کنید. جهت استعلام دقیق تخفیف تناژ و هماهنگی بارگیری تماس بگیرید.' }}
              </p>
            </div>

            <div class="shrink-0 flex flex-col items-end border-l border-white/10 pl-4 hidden md:flex">
              <span class="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-1">Total Items</span>
              <span class="text-2xl font-black text-white font-mono tracking-tighter">
                {{ categoryData.products?.length || 0 }} <span class="text-sm text-[#84012B]">ردیف</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- فراخوانی کامپوننت PricingTable و ارسال محصولات به آن -->
      <PricingTable :products="categoryData.products || []" />
      
      <!-- نمایش زیردسته‌ها در صورتی که این دسته، والد باشد (مثلاً ورق استیل -> ورق 304) -->
      <div v-if="categoryData.other_categories && categoryData.other_categories.length > 0" class="mt-16 w-[80%] mx-auto">
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span class="w-1.5 h-6 bg-[#84012B] rounded-full inline-block"></span>
          آلیاژها و دسته‌های زیرمجموعه
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <NuxtLink 
            v-for="sub in categoryData.other_categories" 
            :key="sub.id" 
            :to="`/category/${sub.slug}`"
            class="group p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-[#84012B]/10 hover:border-[#84012B]/50 transition-all text-center"
          >
            <span class="text-zinc-300 font-bold group-hover:text-white transition-colors">
              {{ sub.title }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- SEO Section -->
      <section class="mt-24 border-t border-white/5 pt-16 w-[80%] mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <!-- SEO Text & Links -->
          <div class="lg:col-span-7">
            <h2 class="text-2xl font-black text-white mb-6 border-r-4 border-[#84012B] pr-4">
              {{ currentSeoData.title || categoryData.title }}
            </h2>

            <div :class="['relative transition-all duration-700 overflow-hidden', isSeoTextExpanded ? 'max-h-[1000px]' : 'max-h-[100px]']">
              <p class="text-zinc-400 text-sm leading-loose text-justify whitespace-pre-line">
                {{ currentSeoData.content }}
              </p>
              <div v-show="!isSeoTextExpanded" class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#08080a] to-transparent pointer-events-none"></div>
            </div>

            <button 
              @click="isSeoTextExpanded = !isSeoTextExpanded" 
              class="text-xs font-bold text-[#ff477e] hover:text-white transition-colors mt-4 mb-8 flex items-center gap-1"
            >
              {{ isSeoTextExpanded ? 'بستن توضیحات' : 'مطالعه ادامه مطلب' }}
              <svg :class="['w-3 h-3 transition-transform', isSeoTextExpanded ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          
            <div v-if="currentSeoData.links && currentSeoData.links.length > 0">
              <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-widest text-zinc-500 font-mono">Related Categories</h3>
              <div class="flex flex-wrap gap-2">
                <NuxtLink 
                  v-for="(link, index) in currentSeoData.links" 
                  :key="index"
                  :to="link.url"
                  class="px-4 py-2 bg-white/5 border border-white/10 hover:border-[#84012B] text-zinc-300 hover:text-white text-xs font-bold transition-all"
                >
                  {{ link.text }}
                </NuxtLink>
              </div>
            </div>
          </div>
        
          <!-- FAQs -->
          <div class="lg:col-span-5" v-if="currentSeoData.faqs && currentSeoData.faqs.length > 0">
            <h3 class="text-lg font-black text-white mb-6">سوالات متداول این دسته</h3>

            <div class="space-y-3">
              <div 
                v-for="(faq, index) in currentSeoData.faqs" 
                :key="index"
                :class="['bg-[#0a0a0c] border transition-colors duration-300', activeFaq === index ? 'border-[#84012B]/50' : 'border-white/5']"
              >
                <button 
                  @click="toggleFaq(index)" 
                  class="w-full flex items-center justify-between p-4 text-right"
                >
                  <span class="text-sm font-bold text-zinc-200 pr-2 border-r-2 border-[#84012B]">{{ faq.q }}</span>
                  <span :class="['text-[#ff477e] transition-transform duration-300 shrink-0 ml-2', activeFaq === index ? 'rotate-45' : '']">+</span>
                </button>

                <div :class="['grid transition-all duration-300 ease-in-out', activeFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0']">
                  <div class="overflow-hidden">
                    <p class="p-4 pt-0 text-xs text-zinc-400 leading-relaxed text-justify">
                      {{ faq.a }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
        </div>
      </section>
    </div>
    
    <!-- Sticky Mobile CTA Bar -->
    <div class="md:hidden bottom-0 left-0 w-full z-50 bg-[#050505]/95 backdrop-blur-md border-t border-zinc-800 p-4 pb-safe flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-transform duration-300">
      <div class="flex flex-col">
        <span class="text-zinc-400 text-xs font-bold mb-0.5">مشاوره و خرید</span>
        <a href="tel:02112345678" class="text-white font-black text-lg tracking-widest" dir="ltr">021-12345678</a>
      </div>
      <a href="tel:02112345678" class="bg-[#84012B] hover:bg-[#a60237] text-white px-5 py-3 rounded-xl font-bold transition-colors flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        استعلام قیمت
      </a>
    </div>
  </main>
</template>
<style scoped>
  body{
    background-color: #08080a;
  }
</style>