import codecs
import re

path = 'app/components/TeamSwiper.vue'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

content = re.sub(
    r'<div class="flex items-center gap-1\.5 justify-center">',
    r'<div class="flex items-center gap-1.5 justify-center flex-wrap">',
    content
)

content = re.sub(
    r'<span class="text-white font-bold tracking-wider"',
    r'<span class="text-white font-bold tracking-wider whitespace-nowrap"',
    content
)

content = re.sub(
    r'class="text-xs bg-white/10 px-1\.5 py-0\.5 rounded text-white"',
    r'class="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white whitespace-nowrap"',
    content
)

# Fix extension for management back to '301 و 302' if they changed it
content = content.replace("ext: '301,302'", "ext: '301 و 302'")

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

print("TeamSwiper.vue updated")

# Also update index.vue to ensure the extension is '301 و 302'
index_path = 'app/pages/index.vue'
with codecs.open(index_path, 'r', 'utf-8') as f:
    idx_content = f.read()
idx_content = idx_content.replace("ext: '301,302'", "ext: '301 و 302'")
with codecs.open(index_path, 'w', 'utf-8') as f:
    f.write(idx_content)
print("index.vue updated")
