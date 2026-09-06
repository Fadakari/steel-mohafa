const fs = require('fs');
const path = require('path');

const file = path.join('app', 'pages', 'category', '[...slug].vue');
let content = fs.readFileSync(file, 'utf8');

// Add page state and fetchNextPage function
const scriptInjection = `
const currentPage = ref(1)
const isFetchingMore = ref(false)

const fetchNextPage = async () => {
  if (isFetchingMore.value) return
  isFetchingMore.value = true
  currentPage.value++
  try {
    const res = await $fetch(\`/api/category/\${fullSlugPath.value}?page=\${currentPage.value}\`)
    if (res && res.products && res.products.length > 0) {
      categoryData.value.products.push(...res.products)
    }
  } catch (err) {
    console.error('Failed to load more products', err)
  } finally {
    isFetchingMore.value = false
  }
}
`

content = content.replace(
  /const route = useRoute\(\)/,
  "const route = useRoute()\n" + scriptInjection
)

content = content.replace(
  /<PricingTable :products="categoryData\.products \|\| \[\]" \/>/,
  '<PricingTable :products="categoryData.products || []" @load-more="fetchNextPage" />'
)

fs.writeFileSync(file, content, 'utf8');
console.log('Added load-more handling to category page');
