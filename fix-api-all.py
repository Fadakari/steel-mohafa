import codecs

with open('regex.txt', 'r', encoding='utf-8') as f:
    target_slug_line = f.read().strip()
    parent_slug_line = target_slug_line.replace('targetSlug = slugs[slugs.length - 1]', 'parentSlug = slugs.length > 1 ? slugs[slugs.length - 2]') + ' : null'

api_content = f"""import {{ prisma }} from '../../utils/prisma'

export default defineEventHandler(async (event) => {{
  const rawSlug = getRouterParam(event, 'slug')
  
  // Set SWR caching headers so that browser doesn't cache but Nitro/CDN caches for 10 minutes
  setHeader(event, 'cache-control', 's-maxage=600, stale-while-revalidate')
  
  if (!rawSlug) {{
    throw createError({{ statusCode: 400, statusMessage: 'Slug is required' }})
  }}

  const slugs = rawSlug.split('/')
  {target_slug_line}
  {parent_slug_line}

  try {{
    const categoryData = await prisma.categories.findFirst({{
      where: {{
        slug: targetSlug,
        ...(parentSlug ? {{
          categories: {{
            slug: parentSlug
          }}
        }} : {{
          parent_id: null
        }})
      }},
      include: {{
        // Fetch sub-categories if any
        other_categories: {{
          select: {{
            id: true,
            title: true,
            slug: true
          }}
        }},
        // Fetch ALL products within this category (no pagination)
        products: {{
          where: {{
            is_active: true
          }},
          orderBy: {{
            sort: 'asc'
          }},
          include: {{
            // ONLY select essential fields to keep payload tiny
            product_pricing_attributes: {{
              select: {{
                unit: true,
                calculated_total_price_per_unit: true,
                calculated_price_per_kg: true
              }}
            }},
            price_history: {{
              select: {{ id: true }},
              take: 2 // We only need to know if length > 1 for the chart button
            }}
          }}
        }}
      }}
    }})

    if (!categoryData) {{
      throw createError({{ statusCode: 404, statusMessage: 'Category not found' }})
    }}

    const result = {{
      ...categoryData,
      products: [...(categoryData.products || [])]
    }}

    // If this is a parent category, fetch ALL products for ALL subcategories
    if (result.other_categories && result.other_categories.length > 0) {{
      const subCatIds = result.other_categories.map((c: any) => c.id)
      
      const subProducts = await prisma.products.findMany({{
        where: {{
          category_id: {{ in: subCatIds }},
          is_active: true
        }},
        orderBy: {{
          sort: 'asc'
        }},
        include: {{
          // ONLY select essential fields to keep payload tiny
          product_pricing_attributes: {{
            select: {{
              unit: true,
              calculated_total_price_per_unit: true,
              calculated_price_per_kg: true
            }}
          }},
          price_history: {{
            select: {{ id: true }},
            take: 2
          }}
        }}
      }})
      
      const subCatMap = new Map(result.other_categories.map((c: any) => [c.id, c.title]))
      
      const formattedSubProducts = subProducts.map((p: any) => ({{
        ...p,
        subcategory_title: subCatMap.get(p.category_id)
      }}))
      
      result.products.push(...formattedSubProducts)
    }}

    return result
  }} catch (error) {{
    console.error('Error fetching category pricing data:', error)
    throw createError({{ statusCode: 500, statusMessage: 'Internal Server Error' }})
  }}
}})
"""

with open('server/api/category/[...slug].ts', 'w', encoding='utf-8') as f:
    f.write(api_content)
