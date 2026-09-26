import codecs
import re

with codecs.open('app/pages/category/[...slug].vue', 'r', 'utf-8') as f:
    content = f.read()

item_list_schema = '''    if (categoryData.value && categoryData.value.products && categoryData.value.products.length > 0) {
      schemas.push({
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": categoryData.value.products.map((p, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": p.title,
              "url": `https://mohafa.com/products/${p.slug}`
            }
          }))
        })
      })
    }'''

content = re.sub(r'(\}\)\s*\n\s*\})\s*\n\s*return\s*\{\s*title:', r'\1\n' + item_list_schema + r'\n    return { title:', content)

with codecs.open('app/pages/category/[...slug].vue', 'w', 'utf-8') as f:
    f.write(content)
