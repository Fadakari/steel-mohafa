import codecs
import re

files_to_update = [
    'app/components/TeamSwiper.vue',
    'app/pages/index.vue'
]

new_array = """const teamMembers = ref([
  { id: 1, name: 'مریم مرادی', role: 'مدیر فروش ورق و مقاطع استیل', phone: '021-66391417', ext: '101', image: '/team/maryam-moradi-steel-sales-manager.webp' },
  { id: 2, name: 'حاج مالک فرخ نیا', role: 'مدیر فروش لوله و پروفیل', phone: '021-66391417', ext: '102', image: '/team/asghar-farahnia-pipes-fittings.jpg' },
  { id: 3, name: 'کیمیا نجف زاده', role: 'ورق استیل و مقاطع ضخیم بار', phone: '021-66391417', ext: '103', image: '/team/kimia-najafzadeh-heavy-sections-sales.webp' },
  { id: 4, name: 'ریحانه درخشان زاده', role: 'مدیر فروش ورق و مقاطع استیل', phone: '021-66391417', ext: '104', image: '/team/reyhaneh-derakhshanzadeh-sales-manager.webp' },
  { id: 5, name: 'افسانه مرادی', role: 'مدیر فروش ورق و مقاطع استیل', phone: '021-66391417', ext: '105', image: '/team/afsaneh-moradi-quality-control-manager.jpg' },
  { id: 6, name: 'حسابداری', role: 'حسابداری', phone: '021-66391417', ext: '201', image: '/header-logo.webp' },
  { id: 7, name: 'مدیریت', role: 'مدیریت', phone: '021-66391417', ext: '301 و 302', image: '/header-logo.webp' }
]);"""

pattern = re.compile(r'const teamMembers = ref\(\[.*?\]\);', re.DOTALL)

for path in files_to_update:
    try:
        with codecs.open(path, 'r', 'utf-8') as f:
            content = f.read()
        
        # Replace
        new_content = pattern.sub(new_array, content)
        
        with codecs.open(path, 'w', 'utf-8') as f:
            f.write(new_content)
        print(f"Updated {path}")
    except Exception as e:
        print(f"Error updating {path}: {e}")
