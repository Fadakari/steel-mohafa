import re

file_path = 'app/components/PricingTable.vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the inner use of `slicedProducts` in the template and computed with `filteredProducts`
content = content.replace('slicedProducts', 'filteredProducts')

# 2. Remove the actual slicing computed property:
# const filteredProducts = computed(() => filteredProducts.value.slice(0, visibleCount.value))
# (Because of step 1, slicedProducts became filteredProducts)
content = re.sub(r'const filteredProducts = computed\(\(\) => filteredProducts\.value\.slice\(0, visibleCount\.value\)\)', '', content)

# 3. Remove the visibleCount and loadMore logic
content = re.sub(r'const visibleCount = ref\(50\).*?\}', '', content, flags=re.DOTALL)
content = re.sub(r'const emit = defineEmits\(\[\'load-more\'\]\)', '', content)
content = re.sub(r'const loadMore = \(\) => \{.*?\}', '', content, flags=re.DOTALL)

# 4. Remove the Load More Action div in the template
# We can search for <!-- Load More Action --> and remove the next div
content = re.sub(r'<!-- Load More Action -->\s*<div v-if="filteredProducts\.length > visibleCount".*?</button>\s*</div>', '', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
