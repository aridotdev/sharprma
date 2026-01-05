import db from '../../utils/db'
import { productModel, vendor } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
  try {
    const params = await getValidatedRouterParams(event, paramsSchema.parse)

    const result = await db
      .select({
        id: productModel.id,
        modelName: productModel.modelName,
        inch: productModel.inch,
        vendorId: productModel.vendorId,
        vendorName: vendor.name
      })
      .from(productModel)
      .leftJoin(vendor, eq(productModel.vendorId, vendor.id))
      .where(eq(productModel.id, params.id))
      .limit(1)

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product model not found'
      })
    }

    return {
      success: true,
      data: result[0]
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.issues
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product model',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
