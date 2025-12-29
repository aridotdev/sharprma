import db from '../../utils/db'
import { claim, vendor, user } from '../../database/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { z } from 'zod'
import { CLAIM_STATUSES } from '../../../shared/utils/constant'

// Query schema for filtering
const querySchema = z.object({
    vendorId: z.coerce.number().int().positive().optional(),
    status: z.enum(CLAIM_STATUSES).optional(),
    startDate: z.iso.datetime().optional(), // ISO string
    endDate: z.iso.datetime().optional()   // ISO string
})

export default defineEventHandler(async (event) => {
    try {
        const query = await getValidatedQuery(event, querySchema.parse)

        let conditions = []

        if (query.vendorId) {
            conditions.push(eq(claim.vendorId, query.vendorId))
        }
        if (query.status) {
            conditions.push(eq(claim.claimStatus, query.status))
        }
        if (query.startDate) {
            conditions.push(gte(claim.createdAt, query.startDate))
        }
        if (query.endDate) {
            conditions.push(lte(claim.createdAt, query.endDate))
        }

        const result = await db
            .select({
                id: claim.id,
                claimNumber: claim.claimNumber,
                notification: claim.notification,
                modelName: claim.modelName,
                vendorId: claim.vendorId,
                vendorName: vendor.name,
                inch: claim.inch,
                branch: claim.branch,
                tglKlaim: claim.createdAt,
                status: claim.claimStatus,
                submittedBy: claim.submittedBy,
                submittedByName: user.name,
                updatedAt: claim.updatedAt
            })
            .from(claim)
            .leftJoin(vendor, eq(claim.vendorId, vendor.id))
            .leftJoin(user, eq(claim.submittedBy, user.id))
            .where(and(...conditions))
            .orderBy(desc(claim.createdAt))

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
            statusMessage: 'Failed to fetch claims',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
