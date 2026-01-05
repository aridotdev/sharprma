import db from '../../utils/db'
import { productModel, insertProductModelSchema } from '../../database/schema'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, insertProductModelSchema.parse)

    const result = await db
      .insert(productModel)
      .values(body)
      .returning()

    return {
      success: true,
      data: result[0],
      message: 'Product model created successfully'
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
      statusMessage: 'Failed to create product model',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
