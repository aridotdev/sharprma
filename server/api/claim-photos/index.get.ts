import db from '../../utils/db'
import { claimPhoto } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Query schema for filtering
const querySchema = z.object({
  claimId: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, querySchema.parse)

    const result = await db
      .select()
      .from(claimPhoto)
      .where(eq(claimPhoto.claimId, query.claimId))

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
      statusMessage: 'Failed to fetch photos',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
