<template>
  <main class="bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden">
    
    <section class="relative min-h-[85vh] flex flex-col justify-center pt-24 pb-12">
      
      <div class="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/hero-bg.png" 
          alt="استیل مهفا" 
          class="w-full h-full object-cover object-left opacity-60"
        />
        <div class="absolute inset-0 bg-gradient-to-l from-[#050505] via-[#050505]/90 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] to-transparent"></div>
      </div>

      <div class="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center">
        
        <div class="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-right mt-12 lg:mt-0">
          
          <div 
            ref="heroTagsRef" 
            :class="['flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6 transition-all duration-1000 ease-out', 
                     isHeroTagsVisible ? 'opacity-100 translate-y-0' : (isFirstLoad ? 'opacity-0 translate-y-12' : 'opacity-0 -translate-y-12')]"
          >
            <span class="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs font-medium rounded-full">تامین مستقیم</span>
            <span class="px-3 py-1 bg-[#84012B]/20 border border-[#84012B]/30 text-[#ff477e] text-xs font-medium rounded-full flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-[#ff477e] animate-pulse"></span>
              قیمت لحظه‌ای
            </span>
          </div>

          <h1 
            ref="heroTitleRef" 
            :class="['text-4xl md:text-5xl lg:text-[4rem] font-bold tracking-tight text-white leading-tight mb-6 transition-all duration-1000 ease-out delay-100', 
                     isHeroTitleVisible ? 'opacity-100 translate-y-0' : (isFirstLoad ? 'opacity-0 translate-y-12' : 'opacity-0 -translate-y-12')]"
          >
            مرجع تخصصی تامین <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-l from-[#84012B] to-[#ff477e]">مقاطع استیل</span>
          </h1>

          <p 
            ref="heroDescRef" 
            :class="['text-base md:text-lg text-gray-400 max-w-xl leading-relaxed mb-10 transition-all duration-1000 ease-out delay-200', 
                     isHeroDescVisible ? 'opacity-100 translate-y-0' : (isFirstLoad ? 'opacity-0 translate-y-12' : 'opacity-0 -translate-y-12')]"
          >
            از ورق‌های دکوراتیو ۳۰۴ تا پروفیل‌های صنعتی؛ با استیل مهفا، زنجیره تامین پروژه خود را با قیمت‌های شفاف و بدون واسطه بهینه‌سازی کنید.
          </p>

          <div 
            ref="heroBtnsRef" 
            :class="['flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto transition-all duration-1000 ease-out delay-300', 
                     isHeroBtnsVisible ? 'opacity-100 translate-y-0' : (isFirstLoad ? 'opacity-0 translate-y-12' : 'opacity-0 -translate-y-12')]"
          >
            <NuxtLink to="/products" class="w-full sm:w-auto px-8 py-3.5 bg-[#84012B] hover:bg-[#a30034] text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#84012B]/20">
              مشاهده محصولات
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </NuxtLink>
            
            <button class="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white/20 hover:bg-white/5 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
              محاسبه‌گر وزن
            </button>
          </div>
          
        </div>
      </div>
    </section>

    <section class="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 pb-24 -mt-10 lg:-mt-20">
      <div class="bg-[#09090b] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl opacity-0 animate-fade-in animation-delay-800 relative overflow-hidden">
        
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#84012B] to-transparent opacity-50"></div>

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              تابلوی معاملات زنده
            </h2>
            <p class="text-xs text-gray-500 mt-1">آخرین به‌روزرسانی: دقایقی پیش از بورس کالا</p>
          </div>
          <button class="text-xs font-medium text-[#ff477e] hover:text-white transition-colors flex items-center gap-1">
            مشاهده لیست کامل
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-white/5">
          <div class="flex flex-col pt-4 md:pt-0 pl-0 md:pl-6">
            <span class="text-gray-400 text-sm mb-2">ورق ۳۰۴ تایوان (۲ میل)</span>
            <div class="flex items-end gap-2 mb-1">
              <span class="text-3xl font-mono font-bold text-white tracking-tight">۱۸۵,۰۰۰</span>
              <span class="text-gray-500 text-xs mb-1">تومان / کیلو</span>
            </div>
            <span class="text-green-400 text-xs font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" /></svg>
              ۱.۲٪ افزایش
            </span>
          </div>

          <div class="flex flex-col pt-4 md:pt-0 pr-0 md:pr-6 pl-0 md:pl-6">
            <span class="text-gray-400 text-sm mb-2">پروفیل ۲۰۱ دکوراتیو</span>
            <div class="flex items-end gap-2 mb-1">
              <span class="text-3xl font-mono font-bold text-white tracking-tight">۹۵,۵۰۰</span>
              <span class="text-gray-500 text-xs mb-1">تومان / کیلو</span>
            </div>
            <span class="text-red-400 text-xs font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" /></svg>
              ۰.۵٪ کاهش
            </span>
          </div>

          <div class="flex flex-col pt-4 md:pt-0 pr-0 md:pr-6">
            <span class="text-gray-400 text-sm mb-2">ورق ۳۱۶ نگیر صنعتی</span>
            <div class="flex items-end gap-2 mb-1">
              <span class="text-3xl font-mono font-bold text-white tracking-tight">۲۴۰,۰۰۰</span>
              <span class="text-gray-500 text-xs mb-1">تومان / کیلو</span>
            </div>
            <span class="text-gray-500 text-xs font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>
              بدون تغییر
            </span>
          </div>
        </div>
      </div>
    </section>



    <section ref="advSectionRef" class="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 pb-24 overflow-hidden">
      
      <div :class="['mb-12 md:mb-16 transition-all duration-700 ease-out', isAdvVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">مزیت‌های رقابتی <span class="text-transparent bg-clip-text bg-gradient-to-l from-[#84012B] to-[#ff477e]">مهفا</span></h2>
        <p class="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">زیرساخت قدرتمند ما برای تامین پایدار، سریع و شفاف آهن‌آلات پروژه‌های شما.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[280px]">
        
        <div :class="['md:col-span-2 group bg-[#09090b] border border-white/10 hover:border-[#84012B]/50 rounded-2xl p-8 transition-all duration-[800ms] ease-out flex flex-col justify-between overflow-hidden relative', isAdvVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24']">
          <div class="absolute -top-20 -right-20 w-40 h-40 bg-[#84012B]/20 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          
          <div class="absolute left-4 top-1/2 -translate-y-1/2 w-48 h-48 opacity-20 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <svg viewBox="0 0 100 100" class="w-full h-full transform group-hover:scale-105 transition-transform duration-700">
              <path d="M30 20 L45 20 L45 45 L55 45 L55 20 L70 20 L70 80 L55 80 L55 55 L45 55 L45 80 L30 80 Z" fill="#ffffff05" stroke="#ffffff20" stroke-width="1.5" stroke-linejoin="round" />
              <path d="M30 20 L45 20 L45 45 L55 45 L55 20 L70 20 L70 80 L55 80 L55 55 L45 55 L45 80 L30 80 Z" fill="none" stroke="#ff477e" stroke-width="2" stroke-linejoin="round" stroke-dasharray="60 140" stroke-dashoffset="0" class="hidden group-hover:block animate-scan-path" />
            </svg>
          </div>
          
          <div class="relative z-10 w-full md:w-2/3 mt-auto">
            <h3 class="text-2xl font-bold text-white mb-3">تامین مستقیم از کارخانه</h3>
            <p class="text-gray-400 text-sm leading-relaxed">حذف واسطه‌های سنتی و ارتباط سیستماتیک با برترین نوردکاران خاورمیانه. ما قیمت‌های کف بازار را برای تناژهای بالا تضمین می‌کنیم.</p>
          </div>
        </div>

        <div :class="['group bg-[#09090b] border border-white/10 hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-[800ms] ease-out flex flex-col justify-between overflow-hidden relative', isAdvVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24']" style="transition-delay: 150ms;">
          <div class="absolute top-6 left-6 w-24 h-24 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <line x1="10" y1="50" x2="90" y2="50" stroke="#ffffff20" stroke-width="3" stroke-linecap="round"/>
              <g class="group-hover:-translate-x-[30px] transition-transform duration-[1500ms] ease-in-out">
                <line x1="50" y1="30" x2="50" y2="70" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
                <polygon points="50,50 60,45 60,55" fill="#3b82f6" />
              </g>
            </svg>
          </div>
          
          <div class="relative z-10 mt-auto">
            <h3 class="text-xl font-bold text-white mb-2">ابزارهای مهندسی</h3>
            <p class="text-gray-400 text-sm leading-relaxed mb-4">محاسبه‌گر دقیق وزن مقاطع بر اساس چگالی.</p>
            <span class="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">تست محاسبات <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></span>
          </div>
        </div>

        <div :class="['group bg-[#09090b] border border-white/10 hover:border-emerald-500/50 rounded-2xl p-8 transition-all duration-[800ms] ease-out flex flex-col justify-between relative overflow-hidden', isAdvVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24']" style="transition-delay: 200ms;">
          <div class="absolute top-4 left-4 w-32 h-32 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <polygon points="20,40 50,25 80,40 50,55" fill="#ffffff05" stroke="#ffffff20" stroke-width="1.5" stroke-linejoin="round" class="group-hover:-translate-y-4 transition-transform duration-700" />
              <polygon points="20,50 50,35 80,50 50,65" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linejoin="round" class="group-hover:translate-y-0 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
              <polygon points="20,60 50,45 80,60 50,75" fill="#ffffff05" stroke="#ffffff20" stroke-width="1.5" stroke-linejoin="round" class="group-hover:translate-y-4 transition-transform duration-700" />
            </svg>
          </div>
          
          <div class="relative z-10 mt-auto">
            <h3 class="text-xl font-bold text-white mb-2">تنوع گریدها</h3>
            <p class="text-gray-400 text-sm leading-relaxed">پشتیبانی از سبد آلیاژی ۳۰۴ تا ورق‌های نسوز.</p>
          </div>
        </div>

        <div :class="['md:col-span-2 group bg-[#09090b] border border-white/10 hover:border-[#84012B]/50 rounded-2xl p-8 transition-all duration-[800ms] ease-out flex items-center justify-between overflow-hidden relative', isAdvVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24']" style="transition-delay: 300ms;">
          
          <div class="absolute top-1/2 left-0 w-full h-full -translate-y-1/2 opacity-10 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
            <svg viewBox="0 0 200 50" class="w-full h-full">
              <path d="M10 25 Q 50 5, 100 25 T 190 25" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="4 4"/>
              <circle r="3" fill="#ff477e">
                <animateMotion dur="4s" repeatCount="indefinite" path="M10 25 Q 50 5, 100 25 T 190 25" />
              </circle>
            </svg>
          </div>

          <div class="absolute bottom-0 left-0 h-1 bg-[#84012B] w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-6 mt-auto">
            <div class="w-full md:w-2/3">
              <h3 class="text-2xl font-bold text-white mb-2">لجستیک یکپارچه و تحویل ایمن</h3>
              <p class="text-gray-400 text-sm leading-relaxed">از تایید پیش‌فاکتور تا تحویل در سایت؛ ناوگان ترابری ما با تضمین سلامت بار و بیمه‌نامه رسمی، سفارش شما را تحویل می‌دهد.</p>
            </div>
            <div class="shrink-0 w-full md:w-auto">
               <button class="w-full px-6 py-3 bg-white text-gray-900 text-sm font-bold rounded-lg transition-transform hover:scale-105 active:scale-95">
                 پیگیری سفارش
               </button>
            </div>
          </div>
        </div>

      </div>
    </section>


    <div 
      ref="marqueeRef" 
      :class="['w-full border-y border-white/5 bg-[#09090b] py-6 overflow-hidden relative flex items-center mt-12 transition-all duration-[1200ms] ease-out', isMarqueeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8']" 
      dir="ltr"
    >
      <div class="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-[#050505] to-transparent z-10"></div>
      <div class="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>
      
      <div class="flex animate-marquee whitespace-nowrap items-center">
        <div class="flex items-center justify-around w-max min-w-full gap-16 md:gap-32 px-8">
          <span class="text-gray-600 font-bold text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3"><div class="w-3 h-3 bg-[#84012B] rotate-45"></div> MOBAREKEH STEEL</span>
          <span class="text-gray-600 font-bold text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3"><div class="w-3 h-3 bg-gray-600 rounded-full"></div> ESFAHAN IRON</span>
          <span class="text-gray-600 font-bold text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3"><div class="w-5 h-1 bg-[#ff477e]"></div> OXIN AHVAZ</span>
          <span class="text-gray-600 font-bold text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3"><div class="w-3 h-3 border-2 border-gray-600"></div> KAVIAN STEEL</span>
          <span class="text-gray-600 font-bold text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg> GILAN CO</span>
        </div>
        <div class="flex items-center justify-around w-max min-w-full gap-16 md:gap-32 px-8" aria-hidden="true">
          <span class="text-gray-600 font-bold text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3"><div class="w-3 h-3 bg-[#84012B] rotate-45"></div> MOBAREKEH STEEL</span>
          <span class="text-gray-600 font-bold text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3"><div class="w-3 h-3 bg-gray-600 rounded-full"></div> ESFAHAN IRON</span>
          <span class="text-gray-600 font-bold text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3"><div class="w-5 h-1 bg-[#ff477e]"></div> OXIN AHVAZ</span>
          <span class="text-gray-600 font-bold text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3"><div class="w-3 h-3 border-2 border-gray-600"></div> KAVIAN STEEL</span>
          <span class="text-gray-600 font-bold text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg> GILAN CO</span>
        </div>
      </div>
    </div>

    <section class="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
      
      <div 
        ref="processTitleRef" 
        :class="['mb-16 md:mb-20 text-center transition-all duration-700 ease-out', isProcessTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
      >
        <h2 class="text-3xl md:text-5xl font-black text-white mb-6">ساختار <span class="text-transparent bg-clip-text bg-gradient-to-l from-[#84012B] to-[#ff477e]">تامین پایدار</span></h2>
        <p class="text-gray-400 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
          ما فرآیند سنتی خرید آهن‌آلات را به یک الگوریتم دقیق تبدیل کرده‌ایم. مراحل کار ما را ببینید:
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div class="hidden md:block absolute top-[4.5rem] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10"></div>
        
        <div 
          ref="step1Ref" 
          :class="['group relative bg-transparent transition-all duration-[800ms] ease-out', isStep1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']"
        >
          <div class="w-16 h-16 md:w-20 md:h-20 bg-[#09090b] border-2 border-white/10 group-hover:border-[#84012B] rounded-full flex items-center justify-center mx-auto mb-8 transition-colors duration-500 relative">
            <span class="text-2xl font-black text-white">01</span>
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-[#ff477e] rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </div>
          <div class="text-center bg-[#09090b] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.02] transition-colors duration-500 h-[calc(100%-6rem)]">
            <h3 class="text-xl font-bold text-white mb-4">سورسینگ هوشمند</h3>
            <p class="text-gray-400 text-sm leading-relaxed">ارتباط با بورس کالا و برترین نوردکاران. قیمت‌های جهانی و موجودی انبارها تحلیل می‌شوند تا بهترین نرخ به شما پیشنهاد شود.</p>
          </div>
        </div>

        <div 
          ref="step2Ref" 
          :class="['group relative bg-transparent transition-all duration-[800ms] ease-out md:translate-y-8', isStep2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']"
        >
          <div class="w-16 h-16 md:w-20 md:h-20 bg-[#09090b] border-2 border-white/10 group-hover:border-[#84012B] rounded-full flex items-center justify-center mx-auto mb-8 transition-colors duration-500 relative">
            <span class="text-2xl font-black text-white">02</span>
          </div>
          <div class="text-center bg-[#09090b] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.02] transition-colors duration-500 h-[calc(100%-6rem)]">
            <h3 class="text-xl font-bold text-white mb-4">کنترل کیفی و متالورژی</h3>
            <p class="text-gray-400 text-sm leading-relaxed">تطبیق سرتیفیکیت کالا با استانداردهای ASTM. تضمین درصد نیکل و کروم در مقاطع دکوراتیو و صنعتی پیش از بارگیری.</p>
          </div>
        </div>

        <div 
          ref="step3Ref" 
          :class="['group relative bg-transparent transition-all duration-[800ms] ease-out', isStep3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']"
        >
          <div class="w-16 h-16 md:w-20 md:h-20 bg-[#09090b] border-2 border-white/10 group-hover:border-[#84012B] rounded-full flex items-center justify-center mx-auto mb-8 transition-colors duration-500 relative">
            <span class="text-2xl font-black text-white">03</span>
          </div>
          <div class="text-center bg-[#09090b] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.02] transition-colors duration-500 h-[calc(100%-6rem)]">
            <h3 class="text-xl font-bold text-white mb-4">لجستیک نقطه به نقطه</h3>
            <p class="text-gray-400 text-sm leading-relaxed">بسته‌بندی ایمن و ارسال سریع. ناوگان ترابری ما بار شما را با بیمه‌نامه‌ی معتبر در سایت پروژه تحویل می‌دهد.</p>
          </div>
        </div>

      </div>
    </section>

    <section class="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 py-24">
      
      <div :class="['mb-16 text-center transition-all duration-700 ease-out', isProdTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']" ref="prodTitleRef">
        <h2 class="text-3xl md:text-5xl font-black text-white mb-6">سبد محصولات <span class="text-transparent bg-clip-text bg-gradient-to-l from-[#84012B] to-[#ff477e]">استیل مهفا</span></h2>
        <p class="text-gray-400 max-w-2xl mx-auto">تنوع بی‌نظیر آلیاژها و مقاطع مهندسی‌شده برای پروژه‌های شما.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div ref="card1Ref" :class="['group bg-[#09090b] border border-white/10 rounded-3xl p-8 hover:border-[#84012B]/50 transition-all duration-700 ease-out', isCard1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']">
          <div class="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#84012B]/20 transition-colors">
            <svg class="w-7 h-7 text-[#ff477e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">ورق‌های استیل</h3>
          <p class="text-gray-400 text-sm mb-6 leading-relaxed">انواع ورق ۳۰۴، ۳۱۶ و ۴۳۰ با پرداخت‌های خش‌دار، آینه‌ای و مات در ضخامت‌های مختلف.</p>
          <button class="text-white text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">مشاهده ورق‌ها →</button>
        </div>

        <div ref="card2Ref" :class="['group bg-[#09090b] border border-white/10 hover:border-[#84012B]/50 rounded-3xl p-8 transition-all duration-700 ease-out delay-150', isCard2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']">
          <div class="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#84012B]/20 transition-colors">
            <svg class="w-7 h-7 text-[#ff477e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">پروفیل و لوله</h3>
          <p class="text-gray-400 text-sm mb-6 leading-relaxed">پروفیل‌های دکوراتیو و صنعتی با بالاترین کیفیت جوش و دقت ابعادی برای سازه‌های مدرن.</p>
          <button class="text-white text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">مشاهده پروفیل‌ها →</button>
        </div>

        <div ref="card3Ref" :class="['group bg-[#09090b] border border-white/10 hover:border-[#84012B]/50 rounded-3xl p-8 transition-all duration-700 ease-out delay-300', isCard3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']">
          <div class="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#84012B]/20 transition-colors">
            <svg class="w-7 h-7 text-[#ff477e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-width="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">اتصالات و مقاطع</h3>
          <p class="text-gray-400 text-sm mb-6 leading-relaxed">تامین انواع زانو، سه‌راهی و فلنج‌های استیل صنعتی با گواهی سلامت و آنالیز دقیق شیمیایی.</p>
          <button class="text-white text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">مشاهده اتصالات →</button>
        </div>

      </div>
    </section>


    <section class="relative z-20 max-w-3xl mx-auto px-6 py-24">
      <div class="mb-16 text-center">
        <h2 class="text-3xl md:text-4xl font-black text-white mb-4">پاسخ به ابهامات شما</h2>
        <p class="text-gray-400">سوالات رایجی که همکاران شما در صنعت آهن می‌پرسند.</p>
      </div>
    
      <div class="space-y-4">
        <div ref="faq1Ref" :class="['bg-[#09090b] border transition-all duration-[800ms] ease-out rounded-2xl overflow-hidden', isFaq1Visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24', activeFaq === 1 ? 'border-[#84012B]/50 shadow-[0_0_20px_rgba(132,1,43,0.1)]' : 'border-white/5']">
          <div @click="toggleFaq(1)" class="group flex justify-between items-center p-6 cursor-pointer text-white font-bold text-lg hover:bg-white/5 transition-colors relative">
            <span class="relative z-10 flex items-center gap-3">
              <span :class="['w-2 h-2 rounded-full transition-colors', activeFaq === 1 ? 'bg-[#ff477e]' : 'bg-gray-600']"></span>
              چطور از اصالت آلیاژ استیل مطمئن شویم؟
            </span>
            <span :class="['transition-transform duration-500 text-2xl relative z-10', activeFaq === 1 ? 'rotate-45 text-[#ff477e]' : 'text-gray-500 group-hover:text-white']">+</span>
          </div>
          <div :class="['faq-custom-grid', activeFaq === 1 ? 'is-open' : '']">
            <div class="overflow-hidden">
              <p class="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4 mt-2 mx-6">
                ما در استیل مهفا، تمامی مقاطع را با سرتیفیکیت (آنالیز شیمیایی) معتبر ارائه می‌دهیم. در صورت نیاز، می‌توانید نمونه بار را به آزمایشگاه‌های مورد تایید ما ارسال کنید تا از درصد دقیق نیکل و کروم اطمینان حاصل کنید.
              </p>
            </div>
          </div>
        </div>

        <div ref="faq2Ref" :class="['bg-[#09090b] border transition-all duration-[800ms] ease-out rounded-2xl overflow-hidden delay-100', isFaq2Visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24', activeFaq === 2 ? 'border-[#84012B]/50 shadow-[0_0_20px_rgba(132,1,43,0.1)]' : 'border-white/5']">
          <div @click="toggleFaq(2)" class="group flex justify-between items-center p-6 cursor-pointer text-white font-bold text-lg hover:bg-white/5 transition-colors relative">
            <span class="relative z-10 flex items-center gap-3">
              <span :class="['w-2 h-2 rounded-full transition-colors', activeFaq === 2 ? 'bg-[#ff477e]' : 'bg-gray-600']"></span>
              حداقل تناژ سفارش چقدر است؟
            </span>
            <span :class="['transition-transform duration-500 text-2xl relative z-10', activeFaq === 2 ? 'rotate-45 text-[#ff477e]' : 'text-gray-500 group-hover:text-white']">+</span>
          </div>
          <div :class="['faq-custom-grid', activeFaq === 2 ? 'is-open' : '']">
            <div class="overflow-hidden">
              <p class="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4 mt-2 mx-6">
                برای محصولاتِ خاص، حداقل سفارش یک بندیل یا رول است. اما برای مقاطع دکوراتیو، امکان ارسال شاخه‌ای نیز فراهم است. جهت دریافت قیمت همکاری با کارشناسان ما تماس بگیرید.
              </p>
            </div>
          </div>
        </div>

        <div ref="faq3Ref" :class="['bg-[#09090b] border transition-all duration-[800ms] ease-out rounded-2xl overflow-hidden delay-200', isFaq3Visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24', activeFaq === 3 ? 'border-[#84012B]/50 shadow-[0_0_20px_rgba(132,1,43,0.1)]' : 'border-white/5']">
          <div @click="toggleFaq(3)" class="group flex justify-between items-center p-6 cursor-pointer text-white font-bold text-lg hover:bg-white/5 transition-colors relative">
            <span class="relative z-10 flex items-center gap-3">
              <span :class="['w-2 h-2 rounded-full transition-colors', activeFaq === 3 ? 'bg-[#ff477e]' : 'bg-gray-600']"></span>
              آیا امکان ارسال نمونه وجود دارد؟
            </span>
            <span :class="['transition-transform duration-500 text-2xl relative z-10', activeFaq === 3 ? 'rotate-45 text-[#ff477e]' : 'text-gray-500 group-hover:text-white']">+</span>
          </div>
          <div :class="['faq-custom-grid', activeFaq === 3 ? 'is-open' : '']">
            <div class="overflow-hidden">
              <p class="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4 mt-2 mx-6">
                بله؛ جهت اطمینان از کیفیت سطح و ابعاد دقیق، امکان ارسال نمونه‌های کوتاه (Sample Cut) برای پروژه‌های بزرگ و صنعتی فراهم است.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-4xl mx-auto px-6 pb-24">
      <div class="bg-gradient-to-br from-[#84012B] to-[#4a0017] rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

        <div class="relative z-10">
          <h3 class="text-2xl md:text-4xl font-black text-white mb-6">همین حالا مشاوره رایگان بگیرید</h3>
          <p class="text-white/80 mb-10 text-lg">کارشناسان ما پشت خط هستند تا بهترین قیمت بازار را به شما اعلام کنند.</p>

          <div class="flex flex-col md:flex-row gap-6 justify-center">
            <a href="tel:02166393755" class="flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#84012B] font-bold rounded-xl text-xl hover:scale-105 transition-transform">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.6-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.2-.6-2.4-.6-3.6 0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2 0 10.5 8.5 19 19 19 1.1 0 2-.9 2-2v-3.5c0-1.1-.9-2-2-2z"/></svg>
              ۰۲۱-۶۶۳۹۳۷۵۵
            </a>
            <a href="tel:02166391417" class="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white font-bold rounded-xl text-xl border border-white/20 hover:bg-white/20 transition-all">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.6-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.2-.6-2.4-.6-3.6 0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2 0 10.5 8.5 19 19 19 1.1 0 2-.9 2-2v-3.5c0-1.1-.9-2-2-2z"/></svg>
              ۰۲۱-۶۶۳۹۱۴۱۷
            </a>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// فقط متغیرها در فضای باز تعریف می‌شوند
const advSectionRef = ref(null)
const isAdvVisible = ref(false)
const processSectionRef = ref(null)
const isProcessVisible = ref(false)
const marqueeRef = ref(null)
const isMarqueeVisible = ref(false)

const processTitleRef = ref(null)
const isProcessTitleVisible = ref(false)

const step1Ref = ref(null)
const isStep1Visible = ref(false)

const step2Ref = ref(null)
const isStep2Visible = ref(false)

const step3Ref = ref(null)
const isStep3Visible = ref(false)
const prodTitleRef = ref(null)
const isProdTitleVisible = ref(false)

const card1Ref = ref(null)
const isCard1Visible = ref(false)

const card2Ref = ref(null)
const isCard2Visible = ref(false)

const card3Ref = ref(null)
const isCard3Visible = ref(false)

const faqTitleRef = ref(null)
const isFaqTitleVisible = ref(false)

const faq1Ref = ref(null)
const isFaq1Visible = ref(false)

const faq2Ref = ref(null)
const isFaq2Visible = ref(false)

const faq3Ref = ref(null)
const isFaq3Visible = ref(false)

const ctaRef = ref(null)
const isCtaVisible = ref(false)

const isFirstLoad = ref(true)

// رفرنس‌های تفکیک‌شده برای هیرو
const heroTagsRef = ref(null)
const isHeroTagsVisible = ref(false)

const heroTitleRef = ref(null)
const isHeroTitleVisible = ref(false)

const heroDescRef = ref(null)
const isHeroDescVisible = ref(false)

const heroBtnsRef = ref(null)
const isHeroBtnsVisible = ref(false)

// وضعیت مدیریت آکاردئون‌های FAQ (برای باز و بسته شدن نرم)
const activeFaq = ref(null)
const toggleFaq = (id) => {
  activeFaq.value = activeFaq.value === id ? null : id
}

onMounted(() => {
  const advObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isAdvVisible.value = entry.isIntersecting
    })
  }, { threshold: 0.20 })

  if (advSectionRef.value) {
    advObserver.observe(advSectionRef.value)
  }

  const elementsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // بررسی می‌کند کدام عنصر دیده شده و وضعیت همان را true می‌کند
      if (entry.target === marqueeRef.value) isMarqueeVisible.value = entry.isIntersecting
      if (entry.target === processTitleRef.value) isProcessTitleVisible.value = entry.isIntersecting
      if (entry.target === step1Ref.value) isStep1Visible.value = entry.isIntersecting
      if (entry.target === step2Ref.value) isStep2Visible.value = entry.isIntersecting
      if (entry.target === step3Ref.value) isStep3Visible.value = entry.isIntersecting
    })
  }, { threshold: 0.10 }) // وقتی ۱۵ درصد از هر کادر دیده شد فعال می‌شود

  // متصل کردن عناصر به Observer
  if (marqueeRef.value) elementsObserver.observe(marqueeRef.value)
  if (processTitleRef.value) elementsObserver.observe(processTitleRef.value)
  if (step1Ref.value) elementsObserver.observe(step1Ref.value)
  if (step2Ref.value) elementsObserver.observe(step2Ref.value)
  if (step3Ref.value) elementsObserver.observe(step3Ref.value)

  const productObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target === prodTitleRef.value) isProdTitleVisible.value = entry.isIntersecting
      if (entry.target === card1Ref.value) isCard1Visible.value = entry.isIntersecting
      if (entry.target === card2Ref.value) isCard2Visible.value = entry.isIntersecting
      if (entry.target === card3Ref.value) isCard3Visible.value = entry.isIntersecting
    })
  }, { threshold: 0.1 })

  if (prodTitleRef.value) productObserver.observe(prodTitleRef.value)
  if (card1Ref.value) productObserver.observe(card1Ref.value)
  if (card2Ref.value) productObserver.observe(card2Ref.value)
  if (card3Ref.value) productObserver.observe(card3Ref.value)


  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target === heroTagsRef.value) isHeroTagsVisible.value = entry.isIntersecting
      if (entry.target === heroTitleRef.value) isHeroTitleVisible.value = entry.isIntersecting
      if (entry.target === heroDescRef.value) isHeroDescVisible.value = entry.isIntersecting
      if (entry.target === heroBtnsRef.value) isHeroBtnsVisible.value = entry.isIntersecting

      if (!entry.isIntersecting && entry.boundingClientRect.y < 0) {
        isFirstLoad.value = false
      }
    })
  }, { threshold: 0.15 })

  if (heroTagsRef.value) heroObserver.observe(heroTagsRef.value)
  if (heroTitleRef.value) heroObserver.observe(heroTitleRef.value)
  if (heroDescRef.value) heroObserver.observe(heroDescRef.value)
  if (heroBtnsRef.value) heroObserver.observe(heroBtnsRef.value)


  const faqObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target === faqTitleRef.value) isFaqTitleVisible.value = entry.isIntersecting
      if (entry.target === faq1Ref.value) isFaq1Visible.value = entry.isIntersecting
      if (entry.target === faq2Ref.value) isFaq2Visible.value = entry.isIntersecting
      if (entry.target === faq3Ref.value) isFaq3Visible.value = entry.isIntersecting
      if (entry.target === ctaRef.value) isCtaVisible.value = entry.isIntersecting
    })
  }, { threshold: 0.1 })
  
  if (faqTitleRef.value) faqObserver.observe(faqTitleRef.value)
  if (faq1Ref.value) faqObserver.observe(faq1Ref.value)
  if (faq2Ref.value) faqObserver.observe(faq2Ref.value)
  if (faq3Ref.value) faqObserver.observe(faq3Ref.value)
  if (ctaRef.value) faqObserver.observe(ctaRef.value)
})
</script>

<style scoped>
.animate-fade-in {
  animation: fade-in-up 0.8s ease-out forwards;
}
.faq-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: all 0.3s ease-out;
}
details[open] .faq-content {
  grid-template-rows: 1fr;
}
.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-400 { animation-delay: 0.4s; }
.animation-delay-600 { animation-delay: 0.6s; }
.animation-delay-800 { animation-delay: 0.8s; }

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scan-path {
  0% { stroke-dashoffset: 200; }
  50% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -200; }
}
.animate-scan-path {
  animation: scan-path 3s linear infinite;
}
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}
.animate-marquee {
  animation: marquee 35s linear infinite;
  display: flex;
  width: max-content;
}

.faq-custom-grid {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.faq-custom-grid.is-open {
  grid-template-rows: 1fr;
}
</style>