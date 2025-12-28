import db from '../../utils/db'
import { vendor } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Query schema for filtering
const querySchema = z.object({
    isActive: z.coerce.boolean().optional()
})

export default defineEventHandler(async (event) => {
    try {
        const query = await getValidatedQuery(event, querySchema.parse)

        let queryBuilder = db.select().from(vendor).$dynamic()

        // Filter by isActive if provided
        if (query.isActive !== undefined) {
            queryBuilder = queryBuilder.where(eq(vendor.isActive, query.isActive))
        }

        const vendors = await queryBuilder

        return {
            success: true,
            data: vendors
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
            statusMessage: 'Failed to fetch vendors',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
