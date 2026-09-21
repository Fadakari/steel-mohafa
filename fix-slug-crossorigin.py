import sys

file_path = 'app/pages/blog/[slug].vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_str1 = 'preload \n            class="w-full h-full object-cover"'
new_str1 = 'preload \n            crossorigin="anonymous"\n            class="w-full h-full object-cover"'

if old_str1 in content:
    content = content.replace(old_str1, new_str1)
    
old_str2 = 'loading="lazy"\n                  class="w-full h-full object-cover'
new_str2 = 'loading="lazy"\n                  crossorigin="anonymous"\n                  class="w-full h-full object-cover'

if old_str2 in content:
    content = content.replace(old_str2, new_str2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Successfully added crossorigin to [slug].vue')
