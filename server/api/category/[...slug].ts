import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const rawSlug = getRouterParam(event, 'slug')
  
  if (!rawSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
  }

  const slugs = rawSlug.split('/')
  const targetSlug = slugs[slugs.length - 1]
  const parentSlug = slugs.length > 1 ? slugs[slugs.length - 2] : null

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
            slug: true,
            products: {
              where: {
                is_active: true
              },
              orderBy: {
                sort: 'asc'
              },
              include: {
                price_history: {
                  take: 5,
                  orderBy: {
                    date_created: 'desc'
                  }
                }
              }
            }
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
            // Fetch the last 5 price records for charting/display
            price_history: {
              take: 5,
              orderBy: {
                date_created: 'desc'
              }
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
      for (const subCat of result.other_categories) {
        if (subCat.products && subCat.products.length > 0) {
          const subProducts = subCat.products.map((p: any) => ({
            ...p,
            subcategory_title: subCat.title
          }))
          result.products.push(...subProducts)
        }
      }
    }

    return result
  } catch (error) {
    console.error('Error fetching category pricing data:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
