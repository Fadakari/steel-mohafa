<template>
  <main class="min-h-screen bg-[#050505] text-white overflow-hidden pt-28 pb-20 relative">
    
    <!-- افکت‌های نوری Aurora -->
    <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#84012B] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900 rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>

    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      
      <!-- هدر سئو فرندلی و تکنیکال -->
      <header class="mb-16 border-b border-white/10 pb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-zinc-400 mb-6">
          <span class="w-2 h-2 rounded-full bg-[#ff477e] animate-pulse"></span>
          درباره ما
        </div>
        <h1 class="text-4xl md:text-6xl font-black tracking-tight mb-6">
          استیل مهفا؛ مرجع تخصصی <br />
          <span class="text-transparent bg-clip-text pb-2 bg-gradient-to-l from-[#84012B] to-[#ff477e]">تامین مقاطع استیل</span>
        </h1>
        <p class="text-zinc-400 text-lg max-w-3xl leading-relaxed">
          ما یک ساختار مهندسی شده برای واردات و توزیع ورق‌های استیل ۳۰۴ و ۳۱۶ هستیم. تضمین اصالت، قیمت رقابتی و لجستیک یکپارچه.
        </p>
      </header>

      <!-- بخش محتوای داینامیک از Directus -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
        <div class="lg:col-span-7 prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-[#ff477e] prose-strong:text-white leading-loose">
          <div v-if="pending" class="animate-pulse space-y-4">
            <div class="h-4 bg-white/5 rounded w-3/4"></div>
            <div class="h-4 bg-white/5 rounded w-full"></div>
            <div class="h-4 bg-white/5 rounded w-5/6"></div>
          </div>
          <div v-else v-html="globals?.about_text"></div>
        </div>
        
        <div class="lg:col-span-5 relative group">
          <div class="absolute inset-0 bg-gradient-to-tr from-[#84012B]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl blur-xl"></div>
          <img 
            v-if="globals?.about_image" 
            :src="`http://localhost:8055/assets/${globals.about_image}`" 
            alt="زیرساخت تامین استیل مهفا" 
            class="w-full relative z-10 rounded-2xl border border-white/10 shadow-2xl grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </section>

      <!-- ساختار Bento Grid تکنیکال -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        <!-- کارت ۱ -->
        <article class="bg-[#0a0a0c] border border-white/10 hover:border-[#84012B]/50 p-8 rounded-2xl transition-colors group flex flex-col justify-between">
          <div class="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[#ff477e] group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-2">تضمین متالورژی</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">تمامی مقاطع با سرتیفیکیت معتبر و تضمین درصد دقیق نیکل و کروم ارائه می‌شوند.</p>
          </div>
        </article>

        <!-- کارت ۲ -->
        <article class="bg-[#0a0a0c] border border-white/10 hover:border-blue-500/50 p-8 rounded-2xl transition-colors group flex flex-col justify-between">
          <div class="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-2">لجستیک سریع</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">ارسال مستقیم از انبار به سایت پروژه با ناوگان اختصاصی و بیمه‌نامه رسمی.</p>
          </div>
        </article>

        <!-- کارت ۳ -->
        <article class="bg-[#0a0a0c] border border-white/10 hover:border-white/30 p-8 rounded-2xl transition-colors group flex flex-col justify-between">
          <div class="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <h3 class="text-xl font-bold mb-2">تامین شرکتی</h3>
            <p class="text-zinc-500 text-sm leading-relaxed">ارائه فاکتور رسمی و تامین تناژ بالا ویژه کارخانجات و پیمانکاران صنعتی.</p>
          </div>
        </article>
      </section>

    </div>
  </main>
</template>

<script setup lang="ts">
const { data: globals } = await useFetch('/api/globals', {
  getCachedData() {
    return undefined
  }
})
// سئوی کلاسیک
useSeoMeta({
  title: 'درباره شرکت استیل مهفا | واردکننده تخصصی ورق استیل',
  description: 'استیل مهفا، مرجع تخصصی تامین ورق استیل ۳۰۴ و ۳۱۶ با بهترین قیمت بازار. آشنایی با تاریخچه، خدمات و مزیت‌های رقابتی ما.',
  ogImage: globals.value?.about_image ? `http://localhost:8055/assets/${globals.value.about_image}` : ''
})

// سئوی پیشرفته (JSON-LD) که داینامیک از تنظیمات تغذیه می‌شود
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "استیل مهفا",
        "url": "https://steelmahfa.com",
        "logo": "https://steelmahfa.com/logo.png",
        "description": "مرجع تخصصی تامین مقاطع استیل صنعتی و دکوراتیو در ایران.",
        "telephone": globals.value?.contact_phone || "",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IR",
          "streetAddress": globals.value?.contact_address || ""
        }
      })
    }
  ]
})
</script>

<style scoped>
/* معرفی فایل اصلی تیلویند به این کامپوننت برای کار کردن @apply در نسخه ۴ */
@reference "../assets/css/main.css";

/* استفاده از deep برای اعمال استایل روی کدهای تزریق شده توسط v-html */
:deep(.prose) {
  @apply text-zinc-300;
}

:deep(.tech-block) {
  @apply mb-12 relative pl-6 border-l-2 border-white/10 transition-colors duration-500 hover:border-[#84012B];
}

:deep(.tech-block.highlight) {
  @apply bg-white/[0.02] border-[#84012B] p-6 rounded-r-xl border-l-4;
}

:deep(.tech-badge) {
  @apply block font-mono text-xs text-zinc-500 mb-3 tracking-widest;
}

:deep(.tech-badge.text-accent) {
  @apply text-[#ff477e];
}

:deep(.prose h2) {
  @apply text-2xl md:text-3xl font-black text-white mt-0 mb-4 tracking-tight;
}

:deep(.prose p) {
  @apply text-base md:text-lg leading-loose text-zinc-400 text-justify mb-6;
}

:deep(.prose strong) {
  @apply text-white font-bold bg-white/5 px-1 rounded;
}

:deep(.prose blockquote) {
  @apply font-mono text-sm border-l-2 border-[#ff477e] bg-gradient-to-r from-[#84012B]/20 to-transparent p-4 my-6 text-zinc-300 not-italic rounded-r-lg;
}

:deep(.prose ul) {
  @apply list-none pl-0 space-y-3 mb-6;
}

:deep(.prose li) {
  @apply flex items-start gap-3 text-zinc-400;
}

:deep(.prose li::before) {
  content: "»";
  @apply text-[#ff477e] font-bold mt-0.5;
}

:deep(.prose a) {
  @apply font-bold text-[#ff477e] no-underline border-b border-[#ff477e]/30 hover:border-[#ff477e] transition-colors pb-0.5;
}
</style>




