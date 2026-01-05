import db from '../../utils/db'
import { notificationRef, insertNotificationRefSchema } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
})

// Update schema (partial) - branch cannot be updated
const updateSchema = insertNotificationRefSchema.partial().omit({ branch: true })

export default defineEventHandler(async (event) => {
  try {
    const params = await getValidatedRouterParams(event, paramsSchema.parse)
    const rawBody = await readBody(event)

    // Check if branch is being updated (not allowed)
    if ('branch' in rawBody) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Branch cannot be updated'
      })
    }

    const body = await readValidatedBody(event, updateSchema.parse)

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

    const result = await db
      .update(notificationRef)
      .set(body)
      .where(eq(notificationRef.id, params.id))
      .returning()

    return {
      success: true,
      data: result[0],
      message: 'Notification ref updated successfully'
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
      statusMessage: 'Failed to update notification ref',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
