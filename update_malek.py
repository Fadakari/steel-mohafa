import codecs
import re

files_to_update = [
    'app/components/TeamSwiper.vue',
    'app/pages/index.vue'
]

old_path = "'/team/asghar-farahnia-pipes-fittings.jpg'"
new_path = "'/team/malek-farahnia-sales-manager.webp'"

for path in files_to_update:
    try:
        with codecs.open(path, 'r', 'utf-8') as f:
            content = f.read()
        
        # Replace
        new_content = content.replace(old_path, new_path)
        
        with codecs.open(path, 'w', 'utf-8') as f:
            f.write(new_content)
        print(f"Updated {path}")
    except Exception as e:
        print(f"Error updating {path}: {e}")
