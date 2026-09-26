<template>
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
            <a :href="`tel:${member.phone}`" class="block bg-[#0a0a0c] border border-white/5 rounded-2xl p-8 flex flex-col items-center text-center h-full hover:border-[#84012B]/50 transition-all duration-300 group relative overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-1.5 bg-[#84012B] transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              
              <div class="relative w-28 h-28 mb-5">
                <NuxtImg :src="member.image"
                    :alt="member.name + ' - کارشناس فروش شرکت استیل مهفا برای مشاوره خرید ورق استیل'" 
                    :title="'تماس با ' + member.name + ' برای دریافت لیست قیمت استیل از مهفا'"
                    width="200" height="200" format="webp" quality="80" loading="lazy"
                    class="w-full h-full rounded-full object-cover border-4 border-[#050505] shadow-[0_0_0_2px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_0_2px_#84012B] transition-all duration-300" />
              </div>
              
              <h3 class="font-black text-white text-lg mb-1">{{ member.name }}</h3>
              <p class="text-[#ff477e] text-xs font-bold mb-5 bg-[#84012B]/10 px-3 py-1.5 rounded-md">{{ member.role }}</p>
              
              <div class="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5"></div>
              
              <!-- دکمه بصری تماس -->
              <div class="w-full bg-[#050505] border border-white/5 group-hover:bg-[#84012B] group-hover:border-[#84012B] py-3 rounded-xl flex flex-col items-center justify-center transition-colors">
                  <span class="text-[10px] text-zinc-400 font-mono mb-0.5 group-hover:text-white/70 transition-colors">تماس مستقیم</span>
                  <div class="flex items-center gap-1.5 justify-center">
                    <span class="text-white font-bold tracking-wider" dir="ltr">{{ member.phone }}</span>
                    <span v-if="member.ext" class="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white" dir="rtl">داخلی {{ member.ext }}</span>
                  </div>
                </div>
            </a>
          </SwiperSlide>
        </Swiper>
</template>

<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const teamMembers = ref([
  { id: 1, name: 'مهندس مریم مرادی', role: 'مدیر توسعه بازار (B2B)', phone: '021-66391417', ext: '101', image: '/team/maryam-moradi-b2b-market-development.jpg' },
  { id: 2, name: 'مهندس کیمیا نجفی', role: 'سرپرست مقاطع دکوراتیو', phone: '021-66391417', ext: '102', image: '/team/kimia-najafi-decorative-sections.jpg' },
  { id: 3, name: 'مهندس مالک فرخ‌نیا', role: 'کارشناس لوله و اتصالات', phone: '021-66393755', ext: '103', image: '/team/asghar-farahnia-pipes-fittings.jpg' },
  { id: 4, name: 'مهندس افسانه مرادی', role: 'مدیر کنترل کیفیت (QC)', phone: '021-66391417', ext: '105', image: '/team/afsaneh-moradi-quality-control-manager.jpg' }
]);
</script>
