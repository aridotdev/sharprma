import db from '../../utils/db'
import { productModel, insertProductModelSchema } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
})

// Update schema (partial)
const updateSchema = insertProductModelSchema.partial()

export default defineEventHandler(async (event) => {
  try {
    const params = await getValidatedRouterParams(event, paramsSchema.parse)
    const body = await readValidatedBody(event, updateSchema.parse)

    // Check if exists
    const existing = await db
      .select()
      .from(productModel)
      .where(eq(productModel.id, params.id))
      .limit(1)

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product model not found'
      })
    }

    const result = await db
      .update(productModel)
      .set(body)
      .where(eq(productModel.id, params.id))
      .returning()

    return {
      success: true,
      data: result[0],
      message: 'Product model updated successfully'
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
      statusMessage: 'Failed to update product model',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
