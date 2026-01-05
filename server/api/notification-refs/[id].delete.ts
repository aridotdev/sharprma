import db from '../../utils/db'
import { notificationRef } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
  try {
    const params = await getValidatedRouterParams(event, paramsSchema.parse)

    // Check if exists
    const existing = await db
      .select()
      .from(notificationRef)
      .where(eq(notificationRef.id, params.id))
      .limit(1)

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Notification ref not found'
      })
    }

    await db
      .delete(notificationRef)
      .where(eq(notificationRef.id, params.id))

    return {
      success: true,
      message: 'Notification ref deleted successfully'
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
      statusMessage: 'Failed to delete notification ref',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
