import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const rawSlug = getRouterParam(event, 'slug')
  
  if (!rawSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
  }

    let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug);
    if (decodedSlug.includes('%')) {
        decodedSlug = decodeURIComponent(decodedSlug);
    }
  } catch (e) {}

  const slugs = decodedSlug.split('/')
  const targetSlug = slugs[slugs.length - 1].replace(/ي/g, 'ی').replace(/ك/g, 'ک')
  const parentSlug = slugs.length > 1 ? slugs[slugs.length - 2].replace(/ي/g, 'ی').replace(/ك/g, 'ک') : null

  try {
    const categoryData = await prisma.categories.findFirst({
      where: {
        slug: targetSlug,
        ...(parentSlug ? {
          categories: {
            slug: parentSlug
          }
        } : {
          parent_id: null
        })
      },
      include: {
        // Fetch sub-categories if any
        other_categories: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        // Fetch products within this category
                products: {
          where: {
            is_active: true
          },
          orderBy: {
            sort: 'asc'
          },
          include: {
            product_pricing_attributes: {
              select: {
                unit: true,
                calculated_total_price_per_unit: true,
                calculated_price_per_kg: true
              }
            },
            price_history: {
              select: { id: true, date_created: true },
              take: 5,
              orderBy: [
                  { date_created: 'desc' },
                  { id: 'desc' }
                ]
            }
          }
        }
      }
    })

    if (!categoryData) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }

    const result = {
      ...categoryData,
      products: [...(categoryData.products || [])]
    }

        if (result.other_categories && result.other_categories.length > 0) {
      const subCatIds = result.other_categories.map((c: any) => c.id)
            const subProducts = await prisma.products.findMany({
        where: {
          category_id: { in: subCatIds },
          is_active: true
        },
        orderBy: { sort: 'asc' },
        include: {
          product_pricing_attributes: {
            select: {
              unit: true,
              calculated_total_price_per_unit: true,
              calculated_price_per_kg: true
            }
          },
          price_history: {
            select: { id: true, date_created: true },
            take: 5,
            orderBy: [{ date_created: 'desc' }, { id: 'desc' }]
          }
        }
      })
      const subCatMap = new Map(result.other_categories.map((c: any) => [c.id, c.title]))
      const formattedSubProducts = subProducts.map((p: any) => ({
        ...p,
        subcategory_title: subCatMap.get(p.category_id)
      }))
      result.products.push(...formattedSubProducts)
    }

    return result
  } catch (error) {
    console.error('Error fetching category pricing data:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
