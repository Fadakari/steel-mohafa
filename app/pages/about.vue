<template>
  <main class="min-h-screen bg-[#050505] text-white pt-28 pb-20 relative overflow-hidden">
    <!-- افکت نوری پس‌زمینه -->
    <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-[#84012B] rounded-full filter blur-[150px] opacity-10 pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      
      <!-- ۱. هدر معنایی (Semantic Header) -->
      <header class="mb-24 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold font-mono text-[#ff477e] mb-6 tracking-widest">
          <span class="w-2 h-2 rounded-full bg-[#ff477e] animate-pulse"></span>
          درباره استیل مهفا
        </div>
        <!-- H1 کوتاه‌تر و متمرکزتر -->
        <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
          تامین‌کننده بی‌واسطه <span class="text-transparent bg-clip-text bg-gradient-to-l pb-5 from-[#84012B] to-[#ff477e]">فولاد ضد زنگ</span>
        </h1>
        <p class="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          بیش از ۱۵ سال تجربه در واردات و توزیع مقاطع استنلس استیل. ما کیفیتِ آلیاژ و قیمتِ کفِ بازارِ تهران را برای پروژه‌های شما تضمین می‌کنیم.
        </p>
      </header>

      <!-- ۲. داستان برند و تصویر مستند (اعتمادسازی E-E-A-T) -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32" aria-labelledby="about-story">
        <div class="space-y-6 text-justify">
          <h2 id="about-story" class="text-2xl md:text-3xl font-black text-white border-r-4 border-[#84012B] pr-4">داستان شکل‌گیری استیل مهفا</h2>
          <p class="text-zinc-300 leading-relaxed text-lg">
            ریشه‌های <strong>استیل مهفا</strong> در قلب تپنده‌ی صنعت فولاد ایران، یعنی <strong>بازار آهن شادآباد</strong> شکل گرفت. ما از سال ۱۳۸۷ با هدفِ ایجاد شفافیت در قیمت‌گذاری و حذف دلالانِ واسطه، فعالیت خود را آغاز کردیم. در بازاری که اصالتِ آلیاژ همواره یک دغدغه است، ما با تکیه بر دانشِ مهندسیِ متالورژی، به واردکننده و توزیع‌کننده تخصصیِ <strong>ورق، لوله و پروفیل استیل ۳۰۴ و ۳۱۶</strong> تبدیل شدیم.
          </p>
          <p class="text-zinc-300 leading-relaxed text-lg">
            امروز، استیل مهفا با در اختیار داشتنِ انبارهای مجهز و شبکه‌ی تامینِ مستقیم از برترین کارخانجاتِ جهانی نظیر YUSCO و TISCO، مرجعِ تامینِ متریالِ پروژه‌های پتروشیمی، صنایع دارویی، غذایی و ماشین‌سازیِ کشور است. تعهد ما ارائه بارهایی با <strong>سرتیفیکیت معتبر (MTC)</strong> و آنالیزِ شیمیاییِ دقیق است تا امنیتِ سازه‌های شما تضمین شود.
          </p>
        </div>
        
        <div class="relative group">
          <div class="absolute -inset-2 bg-gradient-to-r from-[#84012B] to-[#ff477e] rounded-3xl opacity-20 group-hover:opacity-40 transition-opacity blur-lg"></div>
          <img src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1400&auto=format&fit=crop" alt="انبار مقاطع استیل مهفا در بازار آهن شادآباد" class="relative rounded-2xl border border-white/10 shadow-2xl w-full h-[450px] object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
          <div class="absolute bottom-6 right-6 bg-[#050505]/90 backdrop-blur-md border border-[#84012B]/50 px-5 py-3 rounded-xl shadow-lg">
            <span class="text-white font-black block text-base mb-1">انبار مرکزی مهفا</span>
            <span class="text-zinc-400 text-xs font-mono">ظرفیت دپوی مقاطع صنعتی و دکوراتیو</span>
          </div>
        </div>
      </section>

      <!-- بخش جدید: آمار و شبکه توزیع (Company Stats) -->
      <section class="mb-32 border-y border-white/5 bg-gradient-to-r from-transparent via-[#0a0a0c] to-transparent py-12" aria-label="آمار عملکرد شرکت">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-x-reverse divide-white/5">
          <div class="flex flex-col items-center justify-center">
            <span class="text-4xl md:text-5xl font-black text-white mb-2 font-mono" dir="ltr">+15</span>
            <span class="text-zinc-400 text-sm font-bold">سال سابقه در بازار آهن</span>
          </div>
          <div class="flex flex-col items-center justify-center">
            <span class="text-4xl md:text-5xl font-black text-white mb-2 font-mono" dir="ltr">+5000</span>
            <span class="text-zinc-400 text-sm font-bold">تن دپوی دائمی مقاطع</span>
          </div>
          <div class="flex flex-col items-center justify-center">
            <span class="text-4xl md:text-5xl font-black text-[#ff477e] mb-2 font-mono" dir="ltr">+850</span>
            <span class="text-zinc-400 text-sm font-bold">مشتری فعال صنعتی</span>
          </div>
          <div class="flex flex-col items-center justify-center">
            <span class="text-4xl md:text-5xl font-black text-white mb-2 font-mono" dir="ltr">+40</span>
            <span class="text-zinc-400 text-sm font-bold">پرسنل تخصصی و فروش</span>
          </div>
        </div>
      </section>

      <!-- ۳. مقادیر کلیدی (Trust Signals برای سئو) -->
      <section class="mb-32" aria-labelledby="core-values">
        <h2 id="core-values" class="sr-only">ارزش‌های سازمانی و مزایای رقابتی</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article class="bg-gradient-to-b from-[#0a0a0c] to-[#050505] border border-white/5 hover:border-[#84012B]/50 p-8 rounded-2xl transition-all duration-300 group">
            <div class="w-16 h-16 rounded-2xl bg-[#84012B]/10 border border-[#84012B]/30 flex items-center justify-center text-[#ff477e] mb-6 group-hover:-translate-y-2 transition-transform duration-300">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 class="text-xl font-black mb-3 text-white">تضمین متالورژی (MTC)</h3>
            <p class="text-zinc-400 text-sm leading-relaxed text-justify">تمامی مقاطع استنلس استیل با گواهینامه معتبر کارخانه و تاییدیه درصد نیکل و کروم (مطابق استاندارد ASTM) تحویل می‌گردند.</p>
          </article>

          <article class="bg-gradient-to-b from-[#0a0a0c] to-[#050505] border border-white/5 hover:border-blue-500/50 p-8 rounded-2xl transition-all duration-300 group">
            <div class="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 class="text-xl font-black mb-3 text-white">لجستیک یکپارچه</h3>
            <p class="text-zinc-400 text-sm leading-relaxed text-justify">فرآیند بارگیری سریع از انبارهای شادآباد و ارسال ایمن به سایت پروژه‌ها در سراسر ایران به همراه صدور بیمه‌نامه معتبر باربری.</p>
          </article>

          <article class="bg-gradient-to-b from-[#0a0a0c] to-[#050505] border border-white/5 hover:border-emerald-500/50 p-8 rounded-2xl transition-all duration-300 group">
            <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 class="text-xl font-black mb-3 text-white">تامین شرکتی و فاکتور رسمی</h3>
            <p class="text-zinc-400 text-sm leading-relaxed text-justify">ظرفیت تامین تناژ بالای ورق و لوله استیل برای کارخانجات و مناقصات دولتی با ارائه فاکتور رسمی و شفافیت کامل مالیاتی.</p>
          </article>
        </div>
      </section>

      <!-- بخش جدید: گالری زیرساخت‌ها و دپارتمان‌ها -->
      <section class="mb-32">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-black text-white mb-4">زیرساخت‌های استیل مهفا</h2>
          <p class="text-zinc-400 text-sm max-w-2xl mx-auto">تصاویری از دپارتمان‌های مختلف شرکت؛ از دفتر مرکزی فروش تا لجستیک و انبارداری در شادآباد.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[400px]">
          <!-- عکس سمت راست (بزرگ) -->
          <div class="md:col-span-2 relative rounded-2xl overflow-hidden group h-[250px] md:h-full">
            <img src="https://images.unsplash.com/photo-1586528116311-ad8ed7c75b8e?q=80&w=800&auto=format&fit=crop" alt="عملیات بارگیری لوله و ورق استیل در انبار مرکزی استیل مهفا در شادآباد" class="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#050505]/90 to-transparent"></div>
            <span class="absolute bottom-4 right-5 text-white font-bold text-lg">عملیات لجستیک و بارگیری روزانه</span>
          </div>
          
          <!-- دو عکس سمت چپ (کوچک زیر هم) -->
          <div class="flex flex-col gap-4 h-full">
            <div class="relative rounded-2xl overflow-hidden group h-[200px] md:h-1/2">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop" alt="دپارتمان مالی و صدور پیش‌فاکتور رسمی ورق استیل در دفتر مهفا" class="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#050505]/90 to-transparent"></div>
              <span class="absolute bottom-4 right-5 text-white font-bold text-sm">دپارتمان حسابداری و امور مالی</span>
            </div>
            <div class="relative rounded-2xl overflow-hidden group h-[200px] md:h-1/2">
              <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=600&auto=format&fit=crop" alt="جلسات دپارتمان فروش مهفا" class="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#050505]/90 to-transparent"></div>
              <span class="absolute bottom-4 right-5 text-white font-bold text-sm">دفتر مرکزی مهندسی فروش</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ۴. کاروسل تیم متخصصین (با Swiper و فلش‌های شیک) -->
      <section class="mb-32">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-white/5 pb-6 gap-6">
          <div>
            <h2 class="text-3xl font-black text-white mb-2">تیم مهندسی و فروش</h2>
            <p class="text-zinc-400 text-sm">ارتباط مستقیم با کارشناسان متالورژی استیل مهفا.</p>
          </div>
          
          <!-- فلش‌های ناوبری کاستوم -->
          <div class="flex items-center gap-3">
            <button class="team-swiper-prev w-12 h-12 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#84012B] hover:border-[#84012B] transition-all duration-300 focus:outline-none">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
            <button class="team-swiper-next w-12 h-12 rounded-xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#84012B] hover:border-[#84012B] transition-all duration-300 focus:outline-none">
              <svg class="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
        
        <Swiper
          :modules="[Navigation, Autoplay]"
          :slides-per-view="1"
          :space-between="24"
          :loop="true"
          :autoplay="{ delay: 5000, disableOnInteraction: false }"
          :navigation="{ nextEl: '.team-swiper-next', prevEl: '.team-swiper-prev' }"
          :breakpoints="{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }"
          class="pb-4"
        >
          <SwiperSlide v-for="member in teamMembers" :key="member.id">
            <!-- کل کارت حالا یک لینک است -->
            <a :href="`tel:${member.phone}`" class="block bg-[#0a0a0c] border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center h-full hover:border-[#84012B]/50 transition-all duration-300 group relative overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-1.5 bg-[#84012B] transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              
              <div class="relative w-28 h-28 mb-5">
                <img :src="member.image" :alt="member.name" class="w-full h-full rounded-full object-cover border-4 border-[#050505] shadow-[0_0_0_2px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_0_2px_#84012B] transition-all duration-300 grayscale group-hover:grayscale-0" />
              </div>
              
              <h3 class="font-black text-white text-lg mb-1">{{ member.name }}</h3>
              <p class="text-[#ff477e] text-xs font-bold mb-5 bg-[#84012B]/10 px-3 py-1.5 rounded-md">{{ member.role }}</p>
              
              <div class="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5"></div>
              
              <!-- دکمه بصری تماس -->
              <div class="w-full bg-[#050505] border border-white/5 group-hover:bg-[#84012B] group-hover:border-[#84012B] py-3 rounded-xl flex flex-col items-center justify-center transition-colors">
                <span class="text-[10px] text-zinc-500 font-mono mb-0.5 group-hover:text-white/70 transition-colors">تماس مستقیم</span>
                <span class="text-white font-bold tracking-wider" dir="ltr">{{ member.phone }}</span>
              </div>
            </a>
          </SwiperSlide>
        </Swiper>
      </section>

      <!-- ۵. کال تو اکشن (CTA) و دانلود رزومه -->
      <section class="bg-gradient-to-br from-[#84012B] to-[#4a0017] rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
        <!-- پترن پس‌زمینه -->
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div class="relative z-10 text-center md:text-right flex-1">
          <h2 class="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">رزومه و اصالت ما را بررسی کنید</h2>
          <p class="text-white/80 text-lg max-w-xl">
            برای آشنایی بیشتر با پروژه‌های تامین شده، استانداردهای متالورژی و ظرفیت تامین استیل مهفا، کاتالوگ رسمی شرکت را دریافت نمایید.
          </p>
        </div>
        
        <div class="relative z-10 shrink-0 w-full md:w-auto">
          <a href="/catalog.pdf" download class="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#84012B] hover:bg-zinc-100 font-black rounded-xl text-lg transition-transform hover:scale-105 shadow-lg shadow-black/20">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            دانلود کاتالوگ شرکت
          </a>
        </div>
      </section>

    </div>
  </main>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// اطلاعات استاتیک تیم (تصاویر باکیفیت به عنوان Placeholder قرار داده شده)
const teamMembers = ref([
  { id: 1, name: 'مهندس آرش کریمی', role: 'مدیر دپارتمان ورق استیل', phone: '021-66393755', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'مهندس مریم حسینی', role: 'کارشناس لوله و اتصالات', phone: '021-66393755', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'مهندس رضا طاهری', role: 'سرپرست مقاطع دکوراتیو', phone: '021-66391417', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop' },
  { id: 4, name: 'مهندس الناز راد', role: 'مدیر توسعه بازار (B2B)', phone: '021-66391417', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop' },
  { id: 5, name: 'مهندس امید کاظمی', role: 'مدیر کنترل کیفیت (QC)', phone: '021-66391417', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' }
]);

// ۱. سئوی متادیتاها (Meta Tags)
useSeoMeta({
  title: 'درباره ما | استیل مهفا - مرجع تخصصی تامین ورق و لوله استیل',
  description: 'آشنایی با شرکت استیل مهفا. بیش از یک دهه تجربه در واردات و تامین مقاطع استیل ۳۰۴ و ۳۱۶ با سرتیفیکیت معتبر در بازار آهن شادآباد.',
  ogTitle: 'درباره استیل مهفا | تامین‌کننده تخصصی فولاد ضد زنگ',
  ogDescription: 'تامین بی‌واسطه ورق، لوله و پروفیل استنلس استیل برای پروژه‌های صنعتی ایران. دارای مگاسنتر اختصاصی در بازار آهن تهران.',
  ogType: 'website', // اصلاح شد
  ogUrl: 'https://mohafa.com/about',
  twitterCard: 'summary_large_image'
})

// ۲. تزریق استروئید به اسکیمای سازمان (E-E-A-T)
useHead({
  link: [
    { rel: 'canonical', href: 'https://mohafa.com/about' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "url": "https://mohafa.com/about",
        "name": "درباره شرکت استیل مهفا",
        "description": "استیل مهفا واردکننده و توزیع‌کننده تخصصی مقاطع استنلس استیل شامل ورق، لوله و پروفیل در گریدهای 304 و 316 در ایران.",
        "mainEntity": {
          "@type": "Organization",
          "@id": "https://mohafa.com/#organization",
          "name": "استیل مهفا",
          "alternateName": "Steel Mahfa",
          "legalName": "شرکت مهندسی فروش استیل مهفا",
          "url": "https://mohafa.com",
          "logo": "https://mohafa.com/logo.png",
          "image": "https://mohafa.com/header-logo.png",
          "foundingDate": "2008",
          "description": "مرجع تخصصی فروش بی‌واسطه آهن‌آلات و فولاد ضد زنگ در بازار آهن تهران.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "بزرگراه فتح، کیلومتر 4، پاساژ غدیر – پلاک 238", // آدرس دقیق‌تر بنویسید
            "addressLocality": "تهران",
            "addressRegion": "تهران",
            "postalCode": "1386853895", // در صورت داشتن اضافه کنید
            "addressCountry": "IR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 35.67383406781865, // طول و عرض جغرافیایی دفتر خود را بگذارید
            "longitude": 51.300444117791024
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+98-21-66393755",
            "contactType": "sales",
            "areaServed": "IR",
            "availableLanguage": ["Persian", "English"]
          },
          "sameAs": [
            "https://www.instagram.com/steelmahfa", // لینک شبکه‌های اجتماعی خودتان
            "https://www.linkedin.com/company/steelmahfa"
          ]
        }
      })
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "خانه", "item": "https://mohafa.com/" },
          { "@type": "ListItem", "position": 2, "name": "درباره ما", "item": "https://mohafa.com/about" }
        ]
      })
    }
  ]
})
</script>