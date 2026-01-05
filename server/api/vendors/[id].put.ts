import db from '../../utils/db'
import { vendor, insertVendorSchema } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
})

// Update schema (partial)
const updateSchema = insertVendorSchema.partial()

export default defineEventHandler(async (event) => {
  try {
    const params = await getValidatedRouterParams(event, paramsSchema.parse)
    const body = await readValidatedBody(event, updateSchema.parse)

    // Check if vendor exists
    const existing = await db
      .select()
      .from(vendor)
      .where(eq(vendor.id, params.id))
      .limit(1)

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vendor not found'
      })
    }

    const result = await db
      .update(vendor)
      .set(body)
      .where(eq(vendor.id, params.id))
      .returning()

    return {
      success: true,
      data: result[0],
      message: 'Vendor updated successfully'
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
      statusMessage: 'Failed to update vendor',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
