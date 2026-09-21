import sys

file_path = 'app/pages/blog/index.vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_start = '<div class="min-h-screen bg-[#050505] pt-28 md:pt-36 pb-20 px-4 md:px-8 selection:bg-[#84012b7a] selection:text-white">'
new_start = '<main class="min-h-screen bg-[#050505] pt-28 md:pt-36 pb-20 px-4 md:px-8 selection:bg-[#84012b7a] selection:text-white">'

if old_start in content:
    content = content.replace(old_start, new_start, 1)
    
    last_div_index = content.rfind('</div>\n</template>')
    if last_div_index != -1:
        content = content[:last_div_index] + '</main>\n</template>' + content[last_div_index+18:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Successfully replaced div with main.')
    else:
        print('Could not find last </div>.')
else:
    print('Could not find opening div.')
