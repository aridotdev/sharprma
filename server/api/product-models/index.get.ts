import db from '../../utils/db'
import { productModel, vendor } from '../../database/schema'
import { eq, like } from 'drizzle-orm'
import { z } from 'zod'

// Query schema
const querySchema = z.object({
  search: z.string().optional(),
  vendorId: z.coerce.number().int().positive().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, querySchema.parse)

    let queryBuilder = db
      .select({
        id: productModel.id,
        modelName: productModel.modelName,
        inch: productModel.inch,
        vendorId: productModel.vendorId,
        vendorName: vendor.name
      })
      .from(productModel)
      .leftJoin(vendor, eq(productModel.vendorId, vendor.id))
      .$dynamic()

    if (query.search) {
      queryBuilder = queryBuilder.where(like(productModel.modelName, `%${query.search}%`))
    }

    if (query.vendorId) {
      queryBuilder = queryBuilder.where(eq(productModel.vendorId, query.vendorId))
    }

    const models = await queryBuilder.limit(50)

    return {
      success: true,
      data: models
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.issues
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product models',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
