<template>
  <main class="min-h-screen bg-[#050505] text-white pt-28 pb-20 relative overflow-hidden">
    
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-[#84012B] to-transparent opacity-50"></div>

    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      
      <header class="text-center mb-20">
        <h1 class="text-5xl md:text-7xl font-black mb-6 tracking-tighter">ارتباط <span class="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">مستقیم</span></h1>
        <p class="text-zinc-400 text-lg">برای استعلام قیمت تناژ بالا و مشاوره متالورژی با کارشناسان ما در تماس باشید.</p>
      </header>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        <!-- کارت اطلاعات تماس (Brutalist style) -->
        <section class="bg-[#0a0a0c] border border-white/10 rounded-none md:rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>
          
          <h2 class="text-2xl font-bold mb-10 border-b border-white/10 pb-4">اطلاعات دپارتمان فروش</h2>
          
          <div class="space-y-8 relative z-10">
            <!-- تلفن -->
            <div class="flex items-start gap-6 group">
              <div class="w-12 h-12 shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/30 transition-all">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <span class="block text-xs font-mono text-zinc-500 mb-1">PHONE_NUMBER</span>
                <a :href="`tel:${globals?.contact_phone}`" class="text-xl font-bold text-white hover:text-[#ff477e] transition-colors" dir="ltr">
                  {{ globals?.contact_phone || '---' }}
                </a>
              </div>
            </div>

            <!-- ایمیل -->
            <div class="flex items-start gap-6 group">
              <div class="w-12 h-12 shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/30 transition-all">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <span class="block text-xs font-mono text-zinc-500 mb-1">EMAIL_ADDRESS</span>
                <a :href="`mailto:${globals?.contact_email}`" class="text-lg font-medium text-white hover:text-[#ff477e] transition-colors">
                  {{ globals?.contact_email || '---' }}
                </a>
              </div>
            </div>

            <!-- آدرس -->
            <div class="flex items-start gap-6 group">
              <div class="w-12 h-12 shrink-0 bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/30 transition-all">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <span class="block text-xs font-mono text-zinc-500 mb-1">HEADQUARTERS</span>
                <address class="text-base text-zinc-300 not-italic leading-relaxed">
                  {{ globals?.contact_address || '---' }}
                </address>
              </div>
            </div>
          </div>
        </section>

        <!-- نقشه تکنیکال با فیلتر -->
        <section class="bg-[#0a0a0c] border border-white/10 rounded-none md:rounded-2xl p-2 relative h-[500px] lg:h-auto group">
          <div v-if="globals?.map_iframe_url" class="w-full h-full rounded-xl overflow-hidden relative">
            <!-- اورلی تاریک روی نقشه برای حفظ کنتراست سایت (با هاور شدن پاک می‌شود) -->
            <div class="absolute inset-0 bg-[#050505]/40 mix-blend-color pointer-events-none group-hover:opacity-0 transition-opacity duration-500 z-10"></div>
            <iframe 
              :src="globals.map_iframe_url" 
              class="w-full h-full grayscale-[80%] contrast-125 group-hover:grayscale-0 transition-all duration-700" 
              style="border:0;" 
              allowfullscreen="true" 
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-zinc-600 font-mono text-sm border border-dashed border-white/10 rounded-xl">
            [ MAP_DATA_NOT_FOUND ]
          </div>
        </section>

      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const { data: globals } = await useFetch('/api/globals')

useSeoMeta({
  title: 'تماس با استیل مهفا | اطلاعات تماس و آدرس',
  description: 'برای استعلام قیمت روز ورق استیل و مشاوره خرید، با کارشناسان استیل مهفا تماس بگیرید.'
})

// استفاده از LocalBusiness Schema برای سئوی محلی (Local SEO)
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "استیل مهفا",
        "image": "https://steelmahfa.com/logo.png",
        "telephone": globals.value?.contact_phone || "",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": globals.value?.contact_address || "",
          "addressCountry": "IR"
        },
        "url": "https://steelmahfa.com/contact"
      })
    }
  ]
})
</script>