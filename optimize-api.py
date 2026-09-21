import sys

file_path = 'server/api/category/[...slug].ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """        // Fetch sub-categories if any
        other_categories: {
          select: {
            id: true,
            title: true,
            slug: true,
            products: {
          where: {
            is_active: true
          },
          orderBy: {
            sort: 'asc'
          },
          take: take,
          skip: skip,
              include: {
                product_pricing_attributes: true,
                price_history: {
                  take: 5,
                  orderBy: [
                  { date_created: 'desc' },
                  { id: 'desc' }
                ]
                }
              }
            }
          }
        },"""

new_block = """        // Fetch sub-categories if any
        other_categories: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced other_categories block")
else:
    print("Could not find exact old block.")
