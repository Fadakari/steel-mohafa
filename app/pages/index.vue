<template>
  <main class="bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden">
    
    <section class="relative min-h-[85vh] flex flex-col justify-center pt-24 pb-12">
      
      <div class="absolute mt-30 z-0 pointer-events-none">
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
            :class="['text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-tight text-white leading-tight mb-6 transition-all duration-1000 ease-out delay-100', 
                     isHeroTitleVisible ? 'opacity-100 translate-y-0' : (isFirstLoad ? 'opacity-0 translate-y-12' : 'opacity-0 -translate-y-12')]"
          >
            تامین پایدار <span class="text-transparent text-4xl bg-clip-text bg-gradient-to-l pb-2 from-[#84012B] to-[#ff477e]">ورق و لوله استیل</span>
            بدون واسطه‌ در ایران
          </h1>

          <p 
            ref="heroDescRef" 
            :class="['text-base md:text-lg text-gray-400 max-w-xl leading-relaxed mb-10 transition-all duration-1000 ease-out delay-200', 
                     isHeroDescVisible ? 'opacity-100 translate-y-0' : (isFirstLoad ? 'opacity-0 translate-y-12' : 'opacity-0 -translate-y-12')]"
          >
            استیل مهفا، زنجیره تامین مطمئن شما برای انواع مقاطع استیل دکوراتیو و صنعتی (گرید ۳۰۴، ۳۱۶ و...). با ضمانت اصالت آلیاژ، بارگیری مستقیم از انبار تهران و استعلام قیمت لحظه‌ای بورس.
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
      <div class="bg-[#09090b75] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl opacity-0 animate-fade-in animation-delay-800 relative overflow-hidden">

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
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-white/5">
          <div v-for="product in products" :key="product.id" class="flex flex-col pt-4 md:pt-0 md:px-6">
            <span class="text-gray-400 text-sm mb-2">{{ product.name }}</span>
            <div class="flex items-end gap-2 mb-1">
              <span class="text-3xl font-mono font-bold text-white tracking-tight">{{ product.price.toLocaleString('fa-IR') }}</span>
              <span class="text-gray-500 text-xs mb-1">تومان / کیلو</span>
            </div>

            <span :class="['text-xs font-medium flex items-center gap-1', product.trend === 'up' ? 'text-green-400' : product.trend === 'down' ? 'text-red-400' : 'text-gray-500']">
              <svg v-if="product.trend !== 'stable'" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path v-if="product.trend === 'up'" fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                <path v-else fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" />
              </svg>
              {{ product.trend === 'up' ? product.priceDiffPercentage + '% افزایش' : product.trend === 'down' ? product.priceDiffPercentage + '% کاهش' : 'بدون تغییر' }}
            </span>
          </div>
        </div>
      </div>
    </section>



    <section ref="advSectionRef" class="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 pb-16 overflow-hidden">
      
      <div :class="['mb-12 border-b-2 border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 transition-all duration-700 ease-out', isAdvVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']">
        <div>
          <h2 class="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">قدرتِ تامین <span class="text-[#84012B]">مهفا</span></h2>
          <p class="text-zinc-400 font-mono text-sm tracking-widest uppercase">Industrial Supply Infrastructure</p>
        </div>
        <p class="text-gray-400 max-w-md text-sm leading-relaxed text-justify">
          ما صرفا یک فروشنده نیستیم؛ استیل مهفا با در اختیار داشتن شبکه مستقیم ارتباط با نوردکاران، ریسک خرید آهن‌آلات را برای پروژه‌های ملی به صفر رسانده است.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-1 auto-rows-[220px] !md:auto-rows-[330px] !sm:auto-rows-[330px] bg-white/5 p-1 rounded-xl">
        
        <article :class="['md:col-span-2 group bg-[#050505] p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-700', isAdvVisible ? 'opacity-100' : 'opacity-0']">
          <div class="absolute top-0 right-0 w-16 h-16 bg-[#84012B]/10 group-hover:bg-[#84012B]/20 border-l border-b border-white/5 transition-colors flex items-center justify-center">
             <span class="font-mono text-zinc-600 text-xs">01</span>
          </div>
          <div class="relative z-10">
            <h3 class="text-2xl font-black text-white mb-3 tracking-tight">کفِ قیمت بازار (بدون واسطه)</h3>
            <p class="text-zinc-400 text-sm leading-relaxed">
              تامین مستقیم <strong>ورق استیل، لوله و پروفیل</strong> از مبادی اصلی (بورس کالا و واردکنندگان تراز اول). با حذف دلالان، ما ارزان‌ترین نرخ خروجی از انبار تهران را برای خریدهای تناژ بالا تضمین می‌کنیم.
            </p>
          </div>
          <div class="h-1 w-0 bg-[#84012B] group-hover:w-full transition-all duration-500 absolute bottom-0 left-0"></div>
        </article>

        <article :class="['md:col-span-1 group bg-[#050505] p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-700 delay-100', isAdvVisible ? 'opacity-100' : 'opacity-0']">
          <div class="absolute top-0 right-0 w-12 h-12 bg-white/5 border-l border-b border-white/5 flex items-center justify-center">
             <span class="font-mono text-zinc-600 text-xs">02</span>
          </div>
          <div class="relative z-10 mt-auto">
            <h3 class="text-lg font-black text-white mb-2">تضمین متالورژی</h3>
            <p class="text-zinc-500 text-xs leading-relaxed">ارائه <strong>سرتیفیکیت معتبر</strong> و آنالیز شیمیایی دقیق برای تمامی گریدهای ۳۰۴، ۳۱۶ و نسوز.</p>
          </div>
        </article>

        <article :class="['md:col-span-1 group bg-[#050505] p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-700 delay-200', isAdvVisible ? 'opacity-100' : 'opacity-0']">
          <div class="absolute top-0 right-0 w-12 h-12 bg-white/5 border-l border-b border-white/5 flex items-center justify-center">
             <span class="font-mono text-zinc-600 text-xs">03</span>
          </div>
          <div class="relative z-10 mt-auto">
            <h3 class="text-lg font-black text-white mb-2">تنوع مقاطع</h3>
            <p class="text-zinc-500 text-xs leading-relaxed">پوشش کامل نیاز پروژه: از <strong>لوله مانیسمان</strong> تا ورق‌های دکوراتیو میرور و PVD.</p>
          </div>
        </article>

        <article :class="['md:col-span-4 group bg-[#050505] p-8 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden transition-all duration-700 delay-300', isAdvVisible ? 'opacity-100' : 'opacity-0']">
          
          <div class="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>

          <div class="relative z-10 md:w-2/3">
            <h3 class="text-xl font-black text-white mb-2 uppercase tracking-wide">لجستیک یکپارچه و فاکتور رسمی</h3>
            <p class="text-zinc-400 text-sm leading-relaxed">
              صدور پیش‌فاکتور آنی، امکان تسویه حساب منعطف برای شرکت‌ها، و ارسال بار از انبار شادآباد با <strong>بیمه‌نامه معتبر باربری</strong> به سراسر کارخانجات و سایت‌های پروژه‌های ساختمانی ایران.
            </p>
          </div>
          
          <div class="relative z-10 mt-6 md:mt-0 shrink-0 border-r-4 border-[#84012B] pr-4">
             <span class="block text-3xl font-mono font-bold text-white tracking-tighter">100%</span>
             <span class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">تضمین اصالت بار</span>
          </div>
        </article>

      </div>
    </section>

    <div 
      ref="marqueeRef" 
      class="w-full bg-[#050505] border-y border-white/5 py-4 overflow-hidden relative flex items-center mb-24" 
      dir="rtl"
    >
      <div class="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>
      <div class="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-[#050505] to-transparent z-10"></div>
      
      <div class="flex animate-marquee-rtl whitespace-nowrap items-center">
        <div class="flex items-center justify-around w-max min-w-full gap-12 md:gap-24 px-8">
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="w-2 h-2 bg-[#84012B]"></span> فولاد مبارکه اصفهان</span>
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="w-2 h-2 rounded-full bg-zinc-600"></span> مجتمع فولاد گیلان</span>
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="w-1 h-4 bg-[#ff477e]"></span> لوله و پروفیل صفا</span>
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="w-2 h-2 border border-zinc-600"></span> فولاد اکسین خوزستان</span>
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="font-mono text-xs border border-zinc-600 px-1">TS</span> تیسکو (TISCO)</span>
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="font-mono text-xs border border-[#84012B] px-1 text-[#84012B]">YK</span> یوسکو (YUSCO)</span>
        </div>
        <div class="flex items-center justify-around w-max min-w-full gap-12 md:gap-24 px-8" aria-hidden="true">
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="w-2 h-2 bg-[#84012B]"></span> فولاد مبارکه اصفهان</span>
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="w-2 h-2 rounded-full bg-zinc-600"></span> مجتمع فولاد گیلان</span>
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="w-1 h-4 bg-[#ff477e]"></span> لوله و پروفیل صفا</span>
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="w-2 h-2 border border-zinc-600"></span> فولاد اکسین خوزستان</span>
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="font-mono text-xs border border-zinc-600 px-1">TS</span> تیسکو (TISCO)</span>
          <span class="text-zinc-600 font-bold text-lg md:text-xl tracking-wide flex items-center gap-3"><span class="font-mono text-xs border border-[#84012B] px-1 text-[#84012B]">YK</span> یوسکو (YUSCO)</span>
        </div>
      </div>
    </div>

    <section class="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-white/5">
      
      <div 
        ref="processTitleRef" 
        :class="['mb-16 border-r-4 border-[#84012B] pr-6 transition-all duration-700 ease-out', isProcessTitleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12']"
      >
        <h2 class="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter">الگوریتم <span class="text-[#84012B]">تامین و لجستیک</span></h2>
        <p class="text-zinc-400 max-w-2xl text-sm md:text-base leading-relaxed">
          تبدیل فرآیند سنتی خرید آهن‌آلات به یک فلوچارت مهندسی‌شده؛ از سورسینگ در بورس کالا تا تحویل در سایت پروژه با تاییدیه متالورژی.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div class="hidden md:block absolute top-[3rem] left-0 right-0 h-px border-t border-dashed border-white/20 -z-10"></div>
        
        <article 
          ref="step1Ref" 
          :class="['group bg-[#050505] border border-white/10 hover:border-[#84012B] p-8 transition-all duration-700 ease-out relative overflow-hidden', isStep1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']"
        >
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#84012B] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
            <span class="font-mono text-2xl font-black text-white">01</span>
            <div class="absolute -right-2 -top-2 w-4 h-4 border-t border-r border-[#ff477e]"></div>
          </div>
          <h3 class="text-xl font-black text-white mb-4">سورسینگ و کشف قیمت</h3>
          <p class="text-zinc-400 text-sm leading-relaxed text-justify">
            رصد لحظه‌ای <strong>بورس کالا</strong> و انبارهای مبدا. تحلیل نوسانات ارزی برای ارائه <strong>بهترین قیمت ورق و لوله استیل</strong> در تناژ درخواستی شما.
          </p>
        </article>

        <article 
          ref="step2Ref" 
          :class="['group bg-[#050505] border border-white/10 hover:border-blue-500/50 p-8 transition-all duration-700 ease-out relative overflow-hidden md:mt-8', isStep2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']"
        >
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
            <span class="font-mono text-2xl font-black text-white">02</span>
            <div class="absolute -right-2 -top-2 w-4 h-4 border-t border-r border-blue-500"></div>
          </div>
          <h3 class="text-xl font-black text-white mb-4">تاییدیه کنترل کیفی (QC)</h3>
          <p class="text-zinc-400 text-sm leading-relaxed text-justify">
            تطبیق بار با استانداردهای ASTM. بررسی <strong>سرتیفیکیت کارخانه</strong> و تایید درصد عناصر (کروم و نیکل) پیش از اجازه بارگیری مقاطع.
          </p>
        </article>

        <article 
          ref="step3Ref" 
          :class="['group bg-[#050505] border border-white/10 hover:border-emerald-500/50 p-8 transition-all duration-700 ease-out relative overflow-hidden', isStep3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']"
        >
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
            <span class="font-mono text-2xl font-black text-white">03</span>
            <div class="absolute -right-2 -top-2 w-4 h-4 border-t border-r border-emerald-500"></div>
          </div>
          <h3 class="text-xl font-black text-white mb-4">لجستیک و صدور فاکتور</h3>
          <p class="text-zinc-400 text-sm leading-relaxed text-justify">
            بسته‌بندی استاندارد، صدور <strong>فاکتور رسمی</strong>، و ارسال بار با ناوگان ترابری مجهز به همراه <strong>بیمه‌نامه معتبر</strong> تا سایت پروژه.
          </p>
        </article>

      </div>
    </section>

    <section class="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-white/5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmZmZmYwNSIvPjwvc3ZnPg==')]">
      
      <div 
        ref="prodTitleRef" 
        :class="['mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 transition-all duration-700 ease-out', isProdTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
      >
        <div>
          <h2 class="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight uppercase">دپارتمان <span class="text-transparent bg-clip-text bg-gradient-to-l from-[#84012B] to-[#ff477e]">فروش مقاطع</span></h2>
          <p class="text-zinc-400 font-mono text-sm uppercase tracking-widest">Stainless Steel Portfolio</p>
        </div>
        <NuxtLink to="/products" class="shrink-0 px-6 py-3 border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
          کاتالوگ کامل محصولات
          <span class="font-mono">→</span>
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div ref="card1Ref" :class="['group bg-[#050505] border border-white/10 hover:border-[#84012B] p-8 transition-all duration-500 relative flex flex-col', isCard1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h3 class="text-2xl font-black text-white group-hover:text-[#ff477e] transition-colors"><NuxtLink to="/products/ورق-استیل">انواع ورق استیل</NuxtLink></h3>
            <span class="font-mono text-zinc-600 text-sm">CAT.01</span>
          </div>
          <p class="text-zinc-400 text-sm mb-6 flex-grow leading-relaxed">تامین شیت فابریک و رول استیل در ضخامت‌های ۰.۳ تا ۵۰ میل. تضمین سطح بدون تاب و خط و خش.</p>
          
          <ul class="flex flex-wrap gap-2 mt-auto">
            <li><NuxtLink to="/products/ورق-استیل/ورق-استیل-304" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">ورق ۳۰۴ (نگیر)</NuxtLink></li>
            <li><NuxtLink to="/products/ورق-استیل/ورق-استیل-316" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">ورق ۳۱۶ (ضد اسید)</NuxtLink></li>
            <li><NuxtLink to="/products/ورق-استیل/ورق-استیل-براق" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">ورق استیل براق</NuxtLink></li>
            <li><NuxtLink to="/products/ورق-استیل/ورق-استیل-430" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">ورق ۴۳۰ (بگیر)</NuxtLink></li>
          </ul>
        </div>

        <div ref="card2Ref" :class="['group bg-[#050505] border border-white/10 hover:border-[#84012B] p-8 transition-all duration-500 delay-100 relative flex flex-col', isCard2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h3 class="text-2xl font-black text-white group-hover:text-[#ff477e] transition-colors"><NuxtLink to="/products/لوله-استیل/لوله-استیل-صنعتی">لوله استیل صنعتی</NuxtLink></h3>
            <span class="font-mono text-zinc-600 text-sm">CAT.02</span>
          </div>
          <p class="text-zinc-400 text-sm mb-6 flex-grow leading-relaxed">انتقال ایمن سیالات. واردات مستقیم لوله‌های بدون درز و درزدار با سرتیفیکیت‌های تست فشار و کشش.</p>
          
          <ul class="flex flex-wrap gap-2 mt-auto">
            <li><NuxtLink to="/products/لوله-استیل/لوله-استیل-مانیسمان" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">مانیسمان (بدون درز)</NuxtLink></li>
            <li><NuxtLink to="/products/لوله-استیل/لوله-استیل-صنعتی" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">لوله استیل صنعتی</NuxtLink></li>
            <li><NuxtLink to="/products/لوله-استیل/لوله-استیل-صنایع-غذایی" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">لوله صنایع غذایی (دارویی)</NuxtLink></li>
            <li><NuxtLink to="/products/لوله-استیل/لوله-دکوراتیو-استیل" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">لوله دکوراتیو استیل</NuxtLink></li>
          </ul>
        </div>

        <div ref="card3Ref" :class="['group bg-[#050505] border border-white/10 hover:border-[#84012B] p-8 transition-all duration-500 delay-200 relative flex flex-col', isCard3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24']">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h3 class="text-2xl font-black text-white group-hover:text-[#ff477e] transition-colors"><NuxtLink to="/products/پروفیل-استیل/پروفیل-دکوراتیو-استیل">پروفیل و دکوراتیو</NuxtLink></h3>
            <span class="font-mono text-zinc-600 text-sm">CAT.03</span>
          </div>
          <p class="text-zinc-400 text-sm mb-6 flex-grow leading-relaxed">قوطی و پروفیل‌های استیل با دقت ابعادی بالا. جوش‌پذیری عالی جهت استفاده در سازه‌ها و معماری مدرن.</p>
          
          <ul class="flex flex-wrap gap-2 mt-auto">
            <li><NuxtLink to="/products/پروفیل-استیل?alloy=201" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">پروفیل ۲۰۱</NuxtLink></li>
            <li><NuxtLink to="/products/پروفیل-استیل?alloy=304" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">پروفیل ۳۰۴</NuxtLink></li>
            <li><NuxtLink to="/products/پروفیل-استیل?surface=رزگلد+میرور+(براق)" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">رزگلد میرور(براق)</NuxtLink></li>
            <li><NuxtLink to="/products/پروفیل-استیل/پروفیل-صنعتی-استیل" class="px-3 py-1 bg-white/5 hover:bg-[#84012B]/20 border border-white/5 hover:border-[#84012B]/50 text-zinc-300 text-xs font-bold transition-colors">پروفیل صنعتی استیل</NuxtLink></li>
          </ul>
        </div>

      </div>
    </section>


    <section ref="faqSectionRef" class="relative z-20 max-w-4xl mx-auto px-6 py-24">
      <div :class="['mb-16 text-center transition-all duration-700 ease-out', isFaqSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']">
        <h2 class="text-3xl md:text-4xl font-black text-white mb-4">پاسخ به ابهامات شما</h2>
        <p class="text-gray-400">مهم‌ترین سوالات خریداران صنعتی و همکاران بازار آهن</p>
      </div>
    
      <div class="space-y-4">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          :class="[
            'bg-[#09090b] border transition-all duration-[600ms] ease-out rounded-2xl overflow-hidden', 
            isFaqSectionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12',
            activeFaq === index ? 'border-[#84012B]/50 shadow-[0_0_20px_rgba(132,1,43,0.1)]' : 'border-white/5'
          ]"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <div @click="toggleFaq(index)" class="group flex justify-between items-center p-6 cursor-pointer text-white font-bold text-base md:text-lg hover:bg-white/5 transition-colors relative">
            <span class="relative z-10 flex items-center gap-3">
              <span :class="['w-2 h-2 rounded-full transition-colors shrink-0', activeFaq === index ? 'bg-[#ff477e]' : 'bg-gray-600']"></span>
              <h3 class="m-0 p-0 text-base md:text-lg">{{ faq.question }}</h3>
            </span>
            <span :class="['transition-transform duration-500 text-2xl relative z-10 shrink-0 ml-2', activeFaq === index ? 'rotate-45 text-[#ff477e]' : 'text-gray-500 group-hover:text-white']">+</span>
          </div>
          <div :class="['faq-custom-grid', activeFaq === index ? 'is-open' : '']">
            <div class="overflow-hidden">
              <p class="px-6 pb-6 text-gray-400 text-sm md:text-base leading-relaxed border-t border-white/5 pt-4 mt-2 mx-6">
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
      <div class="bg-[#09090b]/50 border border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden transition-all duration-500 hover:border-white/10 shadow-2xl">
        
        <div class="flex items-center gap-3 mb-8">
          <div class="w-2 h-10 bg-gradient-to-b from-[#84012B] to-[#ff477e] rounded-full shadow-[0_0_15px_rgba(132,1,43,0.5)]"></div>
          <h2 class="text-2xl md:text-3xl font-black text-white leading-tight">قیمت روز و خرید بی‌واسطه استنلس استیل؛ مرجع تخصصی فولاد ضد زنگ</h2>
        </div>

        <!-- کانتینر متن با قابلیت باز و بسته شدن -->
        <div :class="['relative transition-all duration-[800ms] overflow-hidden', isSeoTextExpanded ? 'max-h-[2500px]' : 'max-h-[160px]']">
          
          <div class="text-zinc-400 text-sm md:text-base leading-loose space-y-7 text-justify pb-12">
            <p>
              صنعت فولاد نیازمند شفافیت در قیمت‌گذاری و تضمین اصالت متریال است. مجموعه <strong>استیل مهفا</strong> به عنوان یکی از مراجع اصلی تامین و توزیع مقاطع استنلس استیل در بازار آهن شادآباد و پامنار، بستری امن برای <strong>خرید ورق استیل</strong>، لوله، پروفیل و اتصالات صنعتی فراهم کرده است. ما با حذف واسطه‌های سنتی، امکان استعلام لحظه‌ای <strong>قیمت روز آهن‌آلات</strong> را بر اساس نوسانات بورس کالا و نرخ ارز جهانی برای پیمانکاران، کارخانجات و کارگاه‌های تولیدی مهیا ساخته‌ایم.
            </p>
            
            <h3 class="text-xl font-bold text-zinc-200 mt-8 mb-4 border-b border-white/5 pb-2 inline-block">تنوع گریدها در خرید ورق استیل (شیت و رول)</h3>
            <p>
              تامین متریال پایه برای صنایع حساس نیازمند دقت متالورژیکی است. سبد محصولات ما شامل <NuxtLink to="/products" class="text-[#ff477e] hover:text-white transition-colors font-bold">ورق استیل ۳۰۴ (نگیر)</NuxtLink> به عنوان پرکاربردترین آلیاژ بازار، و <NuxtLink to="/products" class="text-[#ff477e] hover:text-white transition-colors font-bold">ورق استیل ۳۱۶ (ضد اسید)</NuxtLink> ویژه صنایع پتروشیمی، دارویی و محیط‌های خورنده می‌باشد. افزون بر این، گریدهای تخصصی نظیر <strong>ورق استیل نسوز ۳۰۹ و ۳۱۰</strong> (مقاوم تا دمای ۱۱۵۰ درجه) و گریدهای اقتصادی <strong>ورق ۲۰۱ و ۴۳۰ (بگیر)</strong> به صورت رول، شیت‌ فابریک و برشی با پرداخت‌های سطحی براق (BA)، مات (2B)، خش‌دار (No.4) و آینه‌ای (Mirror) قابل عرضه می‌باشند.
            </p>

            <h3 class="text-xl font-bold text-zinc-200 mt-8 mb-4 border-b border-white/5 pb-2 inline-block">پروفیل دکوراتیو و لوله استیل صنعتی</h3>
            <p>
              در معماری مدرن و سازه‌های دکوراتیو، کیفیت سطح و جوش‌پذیری حرف اول را می‌زند. استیل مهفا تنوع بی‌نظیری از <strong>پروفیل استیل دکوراتیو</strong> و لوله‌های درزدار را با روکش‌های تیتانیوم PVD در رنگ‌های طلایی، رزگلد، مشکی و برنز تامین می‌کند. همچنین در بخش انتقال سیالات تحت فشار، امکان تامین <strong>لوله مانیسمان استیل (بدون درز)</strong> در رده‌های ۱۰، ۴۰ و ۸۰ به همراه لوله‌های صنایع غذایی (پولیش دارویی) با تاییدیه سلامت و سرتیفیکیت معتبر فراهم است.
            </p>

            <h3 class="text-xl font-bold text-zinc-200 mt-8 mb-4 border-b border-white/5 pb-2 inline-block">اتصالات استیل و خدمات ارزش افزوده</h3>
            <p>
              تکمیل زنجیره تامین شما رسالت ماست. انواع <strong>اتصالات استیل جوشی و دنده‌ای</strong> (شامل زانو، سه‌راهی، فلنج، تبدیل و گسکت) با آلیاژهای منطبق بر استانداردهای ASTM و DIN در انبار ما موجود است. ما تنها یک فروشنده نیستیم؛ با ارائه خدمات ارزش افزوده نظیر <strong>برش لیزر CNC</strong>، نواربری (Slitting)، خدمات پولیش و روکش‌دار کردن مقاطع، متریال را دقیقاً مطابق نقشه‌های مهندسی شما آماده‌سازی و ارسال می‌کنیم. 
            </p>

            <div class="bg-white/5 border-l-2 border-[#84012B] p-4 rounded-r-lg mt-6">
              <strong class="text-white">لجستیک یکپارچه:</strong> تمامی سفارشات، پس از صدور پیش‌فاکتور و تاییدیه کنترل کیفیت (QC)، از انبارهای تهران بارگیری شده و همراه با فاکتور رسمی و بیمه‌نامه معتبر، در کوتاه‌ترین زمان به سراسر ایران ارسال می‌گردند.
            </div>
          </div>

          <!-- هاله محو‌کننده متن در حالت بسته -->
          <div v-show="!isSeoTextExpanded" class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent pointer-events-none"></div>
        </div>

        <!-- دکمه باز و بسته کردن -->
        <div class="mt-2 flex justify-center relative z-10">
          <button 
            @click="isSeoTextExpanded = !isSeoTextExpanded" 
            class="group flex items-center gap-2 text-sm font-bold text-zinc-300 hover:text-white bg-[#0a0a0c] hover:bg-[#84012B]/20 border border-white/10 hover:border-[#84012B]/50 px-8 py-3 rounded-full transition-all duration-300"
          >
            {{ isSeoTextExpanded ? 'بستن توضیحات' : 'مطالعه کامل درباره استیل مهفا' }}
            <svg :class="['w-4 h-4 transition-transform duration-500', isSeoTextExpanded ? 'rotate-180 text-[#ff477e]' : 'group-hover:translate-y-1 text-zinc-500']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
        
      </div>
    </section>

    <section class="max-w-4xl mx-auto px-6 pb-24">
      <div class="bg-gradient-to-br from-[#84012B] to-[#4a0017] rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

        <div class="relative z-10">
          <h3 class="text-2xl md:text-4xl font-black text-white mb-6">همین حالا مشاوره رایگان بگیرید</h3>
          <p class="text-white/80 mb-10 text-lg">کارشناسان ما پشت خط هستند تا بهترین قیمت بازار را به شما اعلام کنند.</p>

          <div class="flex flex-col md:flex-row gap-6 justify-center mt-8">
            <a href="tel:02166393755" aria-label="تماس با دفتر فروش خط یک" class="flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#84012B] font-black rounded-xl text-xl hover:scale-105 transition-transform shadow-lg shadow-white/10">
              <svg class="w-6 h-6 animate-bounce" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.6-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.2-.6-2.4-.6-3.6 0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2 0 10.5 8.5 19 19 19 1.1 0 2-.9 2-2v-3.5c0-1.1-.9-2-2-2z"/></svg>
              <span dir="ltr">۰۲۱ - ۶۶۳۹ ۳۷۵۵</span>
            </a>
            <a href="tel:02166391417" aria-label="تماس با دفتر فروش خط دو" class="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white font-bold rounded-xl text-xl border border-white/20 hover:bg-white/20 transition-all">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.6-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.2-.6-2.4-.6-3.6 0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2 0 10.5 8.5 19 19 19 1.1 0 2-.9 2-2v-3.5c0-1.1-.9-2-2-2z"/></svg>
              <span dir="ltr">۰۲۱ - ۶۶۳۹ ۱۴۱۷</span>
            </a>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isSeoTextExpanded = ref(false)
const faqs = ref([
  {
    question: 'قیمت ورق و لوله استیل در سایت به‌روز است یا نیاز به استعلام دارد؟',
    answer: 'با توجه به نوسانات قیمت ارز و بورس کالا، قیمت‌های تابلوی معاملات زنده استیل مهفا به صورت روزانه آپدیت می‌شوند. با این حال، برای ثبت سفارش نهایی و دریافت پیش‌فاکتور دقیق همراه با تخفیف تناژ، تماس با دفتر فروش الزامی است.'
  },
  {
    question: 'چطور از اصالت آلیاژ استیل (۳۰۴، ۳۱۶ و...) مطمئن شویم؟',
    answer: 'تمامی مقاطع استیل صنعتی و دکوراتیو در استیل مهفا همراه با سرتیفیکیت معتبر کارخانه (آنالیز شیمیایی) ارائه می‌شوند. همچنین امکان ارسال نمونه (Sample) برای تست در آزمایشگاه‌های متالورژی پیش از بارگیری اصلی فراهم است.'
  },
  {
    question: 'آیا استیل مهفا فروش خرد (شاخه‌ای یا برشی) هم دارد؟',
    answer: 'تمرکز اصلی ما بر روی تامین بار پروژه‌ها و فروش عمده (بندیلی و پالتی) است. اما در بخش مقاطع دکوراتیو (مثل لوله و پروفیل‌های طلایی و میرور)، امکان فروش شاخه‌ای برای همکاران و کارگاه‌ها وجود دارد.'
  },
  {
    question: 'شرایط تسویه حساب و پرداخت برای پروژه‌های بزرگ چگونه است؟',
    answer: 'تسویه حساب به صورت نقدی پیش از بارگیری انجام می‌شود. برای شرکت‌های معتبر و پروژه‌های ملی، پس از اعتبارسنجی مالی، امکان عقد قرارداد با شرایط پرداخت مرحله‌ای (چک صیادی معتبر) قابل مذاکره می‌باشد.'
  },
  {
    question: 'تفاوت ورق استیل ۳۰۴ و ۳۱۶ در چیست و کدام را بخرم؟',
    answer: 'گرید ۳۰۴ (نگیر) پرکاربردترین استیل بازار برای محیط‌های معمولی است. اما گرید ۳۱۶ (ضد اسید) به دلیل داشتن مولیبدن، در برابر خوردگیِ اسیدی و محیط‌های دریایی مقاومت بسیار بالاتری دارد و برای صنایع پتروشیمی و غذایی حساس پیشنهاد می‌شود.'
  },
  {
    question: 'آیا خدمات برش لیزر، خم‌کاری و پولیش استیل هم انجام می‌دهید؟',
    answer: 'بله؛ استیل مهفا با در اختیار داشتن مجهزترین کارگاه‌های خدمات فولادی، تمامی درخواست‌های برش لیزر CNC، نواربری (Slitting)، روکش‌دار کردن ورق و پولیش مقاطع را با بالاترین دقت انجام می‌دهد.'
  },
  {
    question: 'ارسال بار به شهرستان‌ها چقدر زمان می‌برد؟',
    answer: 'پس از تایید مالی پیش‌فاکتور، فرآیند بارگیری از انبارهای تهران (شادآباد یا شورآباد) بلافاصله آغاز شده و از طریق معتبرترین باربری‌ها همراه با بیمه‌نامه رسمی، نهایتاً ظرف ۲۴ تا ۴۸ ساعت به تمام نقاط ایران ارسال می‌گردد.'
  }
])

const faqSchema = computed(() => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.value.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.text || faq.answer
      }
    }))
  }
})

useSeoMeta({
  title: 'استیل مهفا | بورس انواع ورق، لوله و پروفیل استیل در ایران',
  description: 'خرید مستقیم و بدون واسطه مقاطع استیل (۳۰۴، ۳۱۶، دکوراتیو و صنعتی). استعلام قیمت لحظه‌ای آهن‌آلات، ارسال به سراسر کشور با تضمین کیفیت و سرتیفیکیت معتبر.',
  ogTitle: 'استیل مهفا - مرجع تخصصی تامین استیل',
  ogDescription: 'تامین یکپارچه سبد محصولات استیل پروژه‌های صنعتی و ساختمانی با قیمت رقابتی.',
  ogImage: 'https://mohafa.com/hero-bg.png', // در پروداکشن آدرس کامل سایت را بگذارید
  twitterCard: 'summary_large_image',
})

useHead({
  script: [
    {
      // 1. اسکیما شرکت و کسب‌وکار محلی (LocalBusiness) - برای لینک شدن به مپ و شماره تماس
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "استیل مهفا",
        "image": "https://mohafa.com/hero-bg.png",
        "@id": "https://mohafa.com",
        "url": "https://mohafa.com",
        "telephone": "+982166393755",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Tehran Province, Tehran، بزرگراه فتح٫، M8G2+27M مجتمع استیل، فتح یازده, Iran", // آدرس دقیق را بعدا تکمیل کنید
          "addressLocality": "تهران",
          "addressRegion": "استان تهران",
          "addressCountry": "IR"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 35.67383406781865, // مختصات دقیق مپ را جایگزین کنید
          "longitude": 51.300444117791024
        },
        "sameAs": [
          // آدرس شبکه‌های اجتماعی خود را اینجا بگذارید
          "https://instagram.com/steelmahfa",
          "https://ble.ir/steelsara"
        ]
      })
    },
    {
      // 2. اسکیما سوالات متداول (FAQ) - باعث می‌شود سوالات زیر لینک شما در گوگل نمایش داده شوند
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(faqSchema.value))
    }
  ]
})

const { data: products } = await useFetch('/api/products/best-sellers')
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
const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index
}
const faqSectionRef = ref(null)
const isFaqSectionVisible = ref(false)

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
      if (entry.target === faqSectionRef.value) isFaqSectionVisible.value = entry.isIntersecting
    })
  }, { threshold: 0.1 })
  
  if (faqSectionRef.value) faqObserver.observe(faqSectionRef.value)
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
@keyframes marquee-rtl {
  0% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
.animate-marquee-rtl {
  animation: marquee-rtl 40s linear infinite;
  display: flex;
  width: max-content;
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