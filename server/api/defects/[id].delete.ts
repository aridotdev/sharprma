import db from '../../utils/db'
import { defect } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
  try {
    const params = await getValidatedRouterParams(event, paramsSchema.parse)

    // Check if defect exists
    const existing = await db
      .select()
      .from(defect)
      .where(eq(defect.id, params.id))
      .limit(1)

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Defect not found'
      })
    }

    const now = new Date().toISOString()

    // Soft delete by setting isActive to false
    const result = await db
      .update(defect)
      .set({
        isActive: false,
        updatedAt: now
      })
      .where(eq(defect.id, params.id))
      .returning()

    return {
      success: true,
      data: result[0],
      message: 'Defect deleted successfully'
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
      statusMessage: 'Failed to delete defect',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
