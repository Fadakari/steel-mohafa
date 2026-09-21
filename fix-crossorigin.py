import sys

file_path = 'app/pages/blog/index.vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_str = ':preload="index === 0"'
new_str = ':preload="index === 0"\n              crossorigin="anonymous"'

if old_str in content:
    content = content.replace(old_str, new_str)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully added crossorigin to NuxtImg in index.vue')
else:
    print('Could not find preload string')
