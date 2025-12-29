import db from '../../utils/db'
import { vendorClaim, vendorClaimItem, claim, vendor, user } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
    try {
        const params = await getValidatedRouterParams(event, paramsSchema.parse)

        // Get Header
        const result = await db
            .select({
                id: vendorClaim.id,
                vendorClaimNo: vendorClaim.vendorClaimNo,
                vendorId: vendorClaim.vendorId,
                vendorName: vendor.name,
                submittedAt: vendorClaim.submittedAt,
                reportSnapshot: vendorClaim.reportSnapshot,
                createdBy: vendorClaim.createdBy,
                createdByName: user.name,
                createdAt: vendorClaim.createdAt,
                updatedAt: vendorClaim.updatedAt
            })
            .from(vendorClaim)
            .leftJoin(vendor, eq(vendorClaim.vendorId, vendor.id))
            .leftJoin(user, eq(vendorClaim.createdBy, user.id))
            .where(eq(vendorClaim.id, params.id))
            .limit(1)

        if (result.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Vendor claim not found'
            })
        }

        // Get Items
        const items = await db
            .select({
                id: vendorClaimItem.id,
                vendorDecision: vendorClaimItem.vendorDecision,
                compensationAmount: vendorClaimItem.compensationAmount,
                note: vendorClaimItem.note,
                decisionAt: vendorClaimItem.decisionAt,
                claimId: claim.id,
                claimNumber: claim.claimNumber,
                modelName: claim.modelName
            })
            .from(vendorClaimItem)
            .leftJoin(claim, eq(vendorClaimItem.claimId, claim.id))
            .where(eq(vendorClaimItem.vendorClaimId, params.id))

        return {
            success: true,
            data: {
                ...result[0],
                items: items
            }
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
            statusMessage: 'Failed to fetch vendor claim',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
