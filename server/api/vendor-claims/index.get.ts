import db from '../../utils/db'
import { vendorClaim, vendor, user } from '../../database/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

// Query schema for filtering
const querySchema = z.object({
    vendorId: z.coerce.number().int().positive().optional()
})

export default defineEventHandler(async (event) => {
    try {
        const query = await getValidatedQuery(event, querySchema.parse)

        const result = await db
            .select({
                id: vendorClaim.id,
                vendorClaimNo: vendorClaim.vendorClaimNo,
                vendorId: vendorClaim.vendorId,
                vendorName: vendor.name,
                submittedAt: vendorClaim.submittedAt,
                createdBy: vendorClaim.createdBy,
                createdByName: user.name,
                createdAt: vendorClaim.createdAt,
                updatedAt: vendorClaim.updatedAt
            })
            .from(vendorClaim)
            .leftJoin(vendor, eq(vendorClaim.vendorId, vendor.id))
            .leftJoin(user, eq(vendorClaim.createdBy, user.id))
            .where(query.vendorId ? eq(vendorClaim.vendorId, query.vendorId) : undefined)
            .orderBy(desc(vendorClaim.createdAt))

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
            statusMessage: 'Failed to fetch vendor claims',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
