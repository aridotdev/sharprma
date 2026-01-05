import db from '../../utils/db'
import { defect, insertDefectSchema } from '../../database/schema'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, insertDefectSchema.parse)

    const now = new Date().toISOString()

    const result = await db
      .insert(defect)
      .values({
        ...body,
        createdAt: now,
        updatedAt: now
      })
      .returning()

    return {
      success: true,
      data: result[0],
      message: 'Defect created successfully'
    }
  } catch (error) {
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
      statusMessage: 'Failed to create defect',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
