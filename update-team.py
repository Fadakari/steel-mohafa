import sys
import re

files = ['app/pages/index.vue', 'app/pages/about.vue']

new_array = """const teamMembers = ref([
  { id: 1, name: 'مهندس مهدی صفرقلی', role: 'مدیر دپارتمان ورق استیل', phone: '021-66393755', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'مهندس مالک فرخنیا', role: 'کارشناس لوله و اتصالات', phone: '021-66393755', image: '/team/asghar-farahnia-pipes-fittings.jpg' },
  { id: 3, name: 'مهندس کیمیا نجفی', role: 'سرپرست مقاطع دکوراتیو', phone: '021-66391417', image: '/team/kimia-najafi-decorative-sections.jpg' },
  { id: 4, name: 'مهندس مریم مرادی', role: 'مدیر توسعه بازار (B2B)', phone: '021-66391417', image: '/team/maryam-moradi-b2b-market-development.jpg' },
  { id: 5, name: 'مهندس افسانه مرادی', role: 'مدیر کنترل کیفیت (QC)', phone: '021-66391417', image: '/team/afsaneh-moradi-quality-control-manager.jpg' }
]);"""

old_nuxt_img = """<NuxtImg :src="member.image"
                    :alt="member.name + ' - کارشناس فروش شرکت استیل محفا برای مشاوره خرید ورق استیل'" 
                    :title="'تماس با ' + member.name + ' برای دریافت لیست قیمت استیل از محفا'"
                    class="w-full h-full rounded-full object-cover border-4 border-[#050505] shadow-[0_0_0_2px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_0_2px_#84012B] transition-all duration-300 grayscale group-hover:grayscale-0" />"""

new_nuxt_img = """<NuxtImg :src="member.image"
                    :alt="member.name + ' - کارشناس فروش شرکت استیل محفا برای مشاوره خرید ورق استیل'" 
                    :title="'تماس با ' + member.name + ' برای دریافت لیست قیمت استیل از محفا'"
                    width="200" height="200" format="webp" quality="80" loading="lazy"
                    class="w-full h-full rounded-full object-cover border-4 border-[#050505] shadow-[0_0_0_2px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_0_2px_#84012B] transition-all duration-300 grayscale group-hover:grayscale-0" />"""

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace array
    content = re.sub(r'const teamMembers = ref\(\[[\s\S]*?\]\);', new_array, content)
    
    # Replace NuxtImg
    if 'width="200"' not in content:
        # NuxtImg might have different text inside due to different encodings or we just regex replace it
        content = re.sub(
            r'<NuxtImg :src="member\.image"[\s\S]*?group-hover:grayscale-0" />',
            new_nuxt_img,
            content
        )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Successfully updated team members.")
