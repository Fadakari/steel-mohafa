import sys

file_path = 'server/api/category/[...slug].ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """    if (result.other_categories && result.other_categories.length > 0) {
      for (const subCat of result.other_categories) {
        if (subCat.products && subCat.products.length > 0) {
          const subProducts = subCat.products.map((p: any) => ({
            ...p,
            subcategory_title: subCat.title
          }))
          result.products.push(...subProducts)
        }
      }
    }"""

new_code = """    if (result.other_categories && result.other_categories.length > 0) {
      const subCatIds = result.other_categories.map((c: any) => c.id)
      
      const subProducts = await prisma.products.findMany({
        where: {
          category_id: { in: subCatIds },
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
      })
      
      const subCatMap = new Map(result.other_categories.map((c: any) => [c.id, c.title]))
      
      const formattedSubProducts = subProducts.map((p: any) => ({
        ...p,
        subcategory_title: subCatMap.get(p.category_id)
      }))
      
      result.products.push(...formattedSubProducts)
    }"""

if old_code in content:
    new_content = content.replace(old_code, new_code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced.")
else:
    print("Old code not found! Trying flexible regex...")
    import re
    # Match the entire block flexibly
    pattern = r'if\s*\(result\.other_categories\s*&&\s*result\.other_categories\.length\s*>\s*0\)\s*\{\s*for\s*\(const\s*subCat\s*of\s*result\.other_categories\)\s*\{\s*if\s*\(subCat\.products\s*&&\s*subCat\.products\.length\s*>\s*0\)\s*\{\s*const\s*subProducts\s*=\s*subCat\.products\.map\(\(p:\s*any\)\s*=>\s*\(\{\s*\.\.\.p,\s*subcategory_title:\s*subCat\.title\s*\}\)\)\s*result\.products\.push\(\.\.\.subProducts\)\s*\}\s*\}\s*\}'
    
    match = re.search(pattern, content)
    if match:
        new_content = content[:match.start()] + new_code + content[match.end():]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully replaced via regex.")
    else:
        print("Still not found.")
