import sys
import re

files = ['app/pages/index.vue', 'app/pages/about.vue']

new_array = """const teamMembers = ref([
  { id: 1, name: 'مهندس مریم مرادی', role: 'مدیر توسعه بازار (B2B)', phone: '021-66391417', ext: '101', image: '/team/maryam-moradi-b2b-market-development.jpg' },
  { id: 2, name: 'مهندس کیمیا نجفی', role: 'سرپرست مقاطع دکوراتیو', phone: '021-66391417', ext: '102', image: '/team/kimia-najafi-decorative-sections.jpg' },
  { id: 3, name: 'مهندس مالک فرخ‌نیا', role: 'کارشناس لوله و اتصالات', phone: '021-66393755', ext: '103', image: '/team/asghar-farahnia-pipes-fittings.jpg' },
  { id: 4, name: 'مهندس افسانه مرادی', role: 'مدیر کنترل کیفیت (QC)', phone: '021-66391417', ext: '105', image: '/team/afsaneh-moradi-quality-control-manager.jpg' }
]);"""

old_ui = """<div class="w-full bg-[#050505] border border-white/5 group-hover:bg-[#84012B] group-hover:border-[#84012B] py-3 rounded-xl flex flex-col items-center justify-center transition-colors">
                  <span class="text-[10px] text-zinc-400 font-mono mb-0.5 group-hover:text-white/70 transition-colors">تماس مستقیم</span>
                  <span class="text-white font-bold tracking-wider" dir="ltr">{{ member.phone }}</span>
                </div>"""

new_ui = """<div class="w-full bg-[#050505] border border-white/5 group-hover:bg-[#84012B] group-hover:border-[#84012B] py-3 rounded-xl flex flex-col items-center justify-center transition-colors">
                  <span class="text-[10px] text-zinc-400 font-mono mb-0.5 group-hover:text-white/70 transition-colors">تماس مستقیم</span>
                  <div class="flex items-center gap-1.5 justify-center">
                    <span class="text-white font-bold tracking-wider" dir="ltr">{{ member.phone }}</span>
                    <span v-if="member.ext" class="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white" dir="rtl">داخلی {{ member.ext }}</span>
                  </div>
                </div>"""

old_json = """"employee": teamMembers.value.map(member => ({
        "@type": "Person",
        "name": member.name,
        "jobTitle": member.role
      })),"""

new_json = """"employee": teamMembers.value.map(member => ({
        "@type": "Person",
        "name": member.name,
        "jobTitle": member.role,
        "telephone": member.ext ? `${member.phone} ext. ${member.ext}` : member.phone,
        "image": `https://mohafa.com${member.image}`
      })),"""

def replace_with_fallback(content, old_str, new_str, label, allow_regex=False):
    # Try exact match first
    if old_str in content:
        print(f"Exact match found for {label}.")
        return content.replace(old_str, new_str)
    
    # Try regex fallback if allowed (useful for encoding issues or slight spacing differences)
    if allow_regex:
        # Create a flexible regex pattern by escaping special chars and allowing variable whitespace
        pattern = re.escape(old_str)
        # We can just try a generic regex for the array and UI
        pass
        
    print(f"WARNING: Could not find {label}.")
    return content

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Update array
        content = re.sub(r'const teamMembers = ref\(\[[\s\S]*?\]\);', new_array, content)
        
        # 2. Update UI
        # Need a regex to handle arbitrary whitespace and Persian chars
        content = re.sub(
            r'<div class="w-full bg-\[\#050505\] border border-white/5 group-hover:bg-\[\#84012B\] group-hover:border-\[\#84012B\] py-3 rounded-xl flex flex-col items-center justify-center transition-colors">\s*<span class="text-\[10px\] text-zinc-400 font-mono mb-0\.5 group-hover:text-white/70 transition-colors">.*?</span>\s*<span class="text-white font-bold tracking-wider" dir="ltr">{{ member\.phone }}</span>\s*</div>',
            new_ui,
            content
        )
        
        # 3. Update JSON-LD
        content = re.sub(
            r'"employee": teamMembers\.value\.map\(member => \(\{\s*"@type": "Person",\s*"name": member\.name,\s*"jobTitle": member\.role\s*\}\)\),',
            new_json,
            content
        )

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Updated {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

