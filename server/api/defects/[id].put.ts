import db from '../../utils/db'
import { defect, updateDefectSchema } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
  try {
    const params = await getValidatedRouterParams(event, paramsSchema.parse)
    const body = await readValidatedBody(event, updateDefectSchema.parse)

    const now = new Date().toISOString()

    const result = await db
      .update(defect)
      .set({
        ...body,
        updatedAt: now
      })
      .where(eq(defect.id, params.id))
      .returning()

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Defect not found'
      })
    }

    return {
      success: true,
      data: result[0],
      message: 'Defect updated successfully'
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
    // Handle unique constraint violation for defectName
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Defect name already exists',
        data: error.message
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update defect',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
