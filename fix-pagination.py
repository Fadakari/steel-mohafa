import re

file_path = 'app/pages/category/[...slug].vue'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove load-more prop
content = re.sub(r'@load-more=[^\s>]+', '', content)

# Add pagination UI right after PricingTable
pagination_ui = """
        <!-- SEO Pagination -->
        <div v-if="categoryData && categoryData.totalPages > 1" class="mt-10 w-[80%] mx-auto flex flex-wrap justify-center gap-2">
          <NuxtLink
            v-for="p in categoryData.totalPages"
            :key="p"
            :to="{ query: { ...$route.query, page: p } }"
            class="px-4 py-2 rounded-lg font-bold font-mono transition-colors border"
            :class="p === categoryData.currentPage ? 'bg-[#84012B] text-white border-[#84012B]' : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-500'"
          >
            {{ p }}
          </NuxtLink>
        </div>
"""
if "<!-- SEO Pagination -->" not in content:
    content = content.replace('<PricingTable :products="categoryData.products || []"  />', '<PricingTable :products="categoryData.products || []" />' + pagination_ui)
    content = content.replace('<PricingTable :products="categoryData.products || []" />', '<PricingTable :products="categoryData.products || []" />' + pagination_ui)

# Update useFetch to react to route.query.page
# In Nuxt 3, if we pass query params explicitly to useFetch, it watches them if we use a computed or ref.
# Let's find useFetch line
content = re.sub(r'useFetch\(`\/api\/category\/\$\{fullSlugPath\.value\}`\)', 'useFetch(() => `/api/category/${fullSlugPath.value}?page=${route.query.page || 1}`)', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
