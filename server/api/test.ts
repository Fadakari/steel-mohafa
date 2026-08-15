import { prisma } from '../utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.categories.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      parent_id: true
    }
  })
})
