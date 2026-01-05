import db from '../../utils/db'
import { vendorFieldRule, vendor } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Query schema for filtering
const querySchema = z.object({
  vendorId: z.coerce.number().int().positive().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, querySchema.parse)

    let result

    if (query.vendorId) {
      // Filter by vendorId
      result = await db
        .select({
          id: vendorFieldRule.id,
          vendorId: vendorFieldRule.vendorId,
          vendorName: vendor.name,
          fieldName: vendorFieldRule.fieldName,
          isRequired: vendorFieldRule.isRequired,
          createdAt: vendorFieldRule.createdAt,
          updatedAt: vendorFieldRule.updatedAt
        })
        .from(vendorFieldRule)
        .leftJoin(vendor, eq(vendorFieldRule.vendorId, vendor.id))
        .where(eq(vendorFieldRule.vendorId, query.vendorId))
    } else {
      // Get all
      result = await db
        .select({
          id: vendorFieldRule.id,
          vendorId: vendorFieldRule.vendorId,
          vendorName: vendor.name,
          fieldName: vendorFieldRule.fieldName,
          isRequired: vendorFieldRule.isRequired,
          createdAt: vendorFieldRule.createdAt,
          updatedAt: vendorFieldRule.updatedAt
        })
        .from(vendorFieldRule)
        .leftJoin(vendor, eq(vendorFieldRule.vendorId, vendor.id))
    }

    return {
      success: true,
      data: result
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
      statusMessage: 'Failed to fetch field rules',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
