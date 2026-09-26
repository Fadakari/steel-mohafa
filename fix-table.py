import re

file_path = 'app/components/PricingTable.vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all uses of slicedProducts with filteredProducts in the template
content = content.replace('slicedProducts', 'filteredProducts')

# Now remove the broken computed property and loadMore logic completely
# We know the broken computed is: const filteredProducts = computed(() => filteredProducts.value.slice(0, visibleCount.value)) 
# Wait, I reverted it! So it's: const slicedProducts = computed(() => filteredProducts.value.slice(0, visibleCount.value))

content = re.sub(r'const visibleCount = ref\(50\).*?\}', '', content, flags=re.DOTALL)
content = re.sub(r'const slicedProducts = computed\(\(\) => filteredProducts\.value\.slice\(0, visibleCount\.value\)\)', '', content)

# Remove the Load More Action div in the template
load_more_div_regex = r'<!-- Load More Action -->\s*<div v-if="filteredProducts\.length > visibleCount".*?</button>\s*</div>'
content = re.sub(load_more_div_regex, '', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
