import db from '../../utils/db'
import { notificationRef, vendor } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Query schema
const querySchema = z.object({
    status: z.enum(['NEW', 'USED', 'EXPIRED']).optional()
})

export default defineEventHandler(async (event) => {
    try {
        const query = await getValidatedQuery(event, querySchema.parse)

        let queryBuilder = db
            .select({
                id: notificationRef.id,
                notificationCode: notificationRef.notificationCode,
                modelName: notificationRef.modelName,
                vendorId: notificationRef.vendorId,
                vendorName: vendor.name,
                status: notificationRef.status,
                createdBy: notificationRef.createdBy
            })
            .from(notificationRef)
            .leftJoin(vendor, eq(notificationRef.vendorId, vendor.id))
            .$dynamic()

        if (query.status) {
            queryBuilder = queryBuilder.where(eq(notificationRef.status, query.status))
        }

        const results = await queryBuilder.limit(50)

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
            statusMessage: 'Failed to fetch notification refs',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
