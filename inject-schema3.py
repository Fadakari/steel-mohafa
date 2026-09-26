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

content = re.sub(r'return\s*\{\s*script:\s*schemas\s*\}', item_list_schema + '\n    return {\n      script: schemas\n    }', content)

with codecs.open('app/pages/category/[...slug].vue', 'w', 'utf-8') as f:
    f.write(content)
