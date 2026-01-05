import db from '../../utils/db'
import { vendor, insertVendorSchema } from '../../database/schema'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, insertVendorSchema.parse)

    const result = await db
      .insert(vendor)
      .values(body)
      .returning()

    return {
      success: true,
      data: result[0],
      message: 'Vendor created successfully'
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
      statusMessage: 'Failed to create vendor',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
