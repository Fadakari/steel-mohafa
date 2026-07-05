<template>
  <footer class="bg-[#050505] border-t border-white/10 pt-20 pb-10">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        <div class="space-y-4">
          <h3 class="text-white font-black text-xl mb-4">استیل مهفا</h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            مرجع تخصصی تامین مقاطع استیل صنعتی و دکوراتیو در ایران. کیفیت، دقت و سرعت را در زنجیره تامین خود تجربه کنید.
          </p>
        </div>

        <div>
          <h4 class="text-white font-bold mb-6">دسترسی سریع</h4>
          <ul class="space-y-3 text-sm text-gray-500">
            <li><NuxtLink to="/products" class="hover:text-[#ff477e] transition-colors">لیست محصولات</NuxtLink></li>
            <li><NuxtLink to="/calculator" class="hover:text-[#ff477e] transition-colors">محاسبه‌گر وزن استیل</NuxtLink></li>
            <li><NuxtLink to="/about" class="hover:text-[#ff477e] transition-colors">درباره ما</NuxtLink></li>
            <li><NuxtLink to="/blog" class="hover:text-[#ff477e] transition-colors">مقالات تخصصی</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-bold mb-6">تماس با کارشناس</h4>
          <ul class="space-y-4 text-sm text-gray-400">
            <li>
              <a href="tel:02166393755" class="hover:text-white transition-colors flex items-center gap-2">
                ۰۲۱-۶۶۳۹۳۷۵۵
              </a>
            </li>
            <li>
              <a href="tel:02166391417" class="hover:text-white transition-colors flex items-center gap-2">
                ۰۲۱-۶۶۳۹۱۴۱۷
              </a>
            </li>
            <li class="pt-2 text-xs text-gray-600">تهران، بازار آهن، پلاک ...</li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-bold mb-6">ما را دنبال کنید</h4>
          <div class="flex gap-4">
            <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#84012B] transition-colors">
              <span class="text-white text-xs font-bold">IG</span>
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#84012B] transition-colors">
              <span class="text-white text-xs font-bold">TG</span>
            </a>
          </div>
        </div>
      </div>

      <div class="pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
        © ۲۰۲۶ کلیه حقوق برای استیل مهفا محفوظ است. طراحی و توسعه هوشمند.
      </div>
    </div>
  </footer>
</template>