import sys

file_path = 'app/pages/index.vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add const img = useImage()
if 'const img = useImage()' not in content:
    content = content.replace('const isSeoTextExpanded = ref(false)', 'const img = useImage()\nconst isSeoTextExpanded = ref(false)')

# Replace the source tag
old_source = """<source media="(max-width: 767px)" :srcset="'/hero-mobile.webp'">"""
new_source = """<source media="(max-width: 767px)" :srcset="img('/hero-mobile.webp', { width: 768, format: 'webp', quality: 80 })">"""

if old_source in content:
    content = content.replace(old_source, new_source)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully updated index.vue')
else:
    print('Failed to find old source tag')
