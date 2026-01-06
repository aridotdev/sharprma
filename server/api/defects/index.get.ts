import db from '../../utils/db'
import { defect } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Query schema
const querySchema = z.object({
  isActive: z.coerce.boolean().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, querySchema.parse)

    let queryBuilder = db
      .select({
        id: defect.id,
        defectName: defect.name,
        isActive: defect.isActive,
        createdAt: defect.createdAt,
        updatedAt: defect.updatedAt
      })
      .from(defect)
      .$dynamic()

    if (query.isActive !== undefined) {
      queryBuilder = queryBuilder.where(eq(defect.isActive, query.isActive))
    } else {
      // Default: only return active defects
      queryBuilder = queryBuilder.where(eq(defect.isActive, true))
    }

    const results = await queryBuilder.orderBy(defect.name)

    return {
      success: true,
      data: results
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
      statusMessage: 'Failed to fetch defects',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
