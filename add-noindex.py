import sys
import re

file_path = 'app/pages/products/[...slug].vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add noindex to meta
old_meta = "meta: ["
new_meta = "meta: [\n        { name: 'robots', content: 'noindex, nofollow' },\n        { name: 'googlebot', content: 'noindex, nofollow' },"

if old_meta in content:
    content = content.replace(old_meta, new_meta, 1) # Only replace first occurrence just in case, but wait, the one in useHead is the one we want.
    # Actually wait, there might be multiple? The regex replace is safer. Let's do string replace.
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added noindex to products page.")
else:
    print("Could not find meta: [")
