import db from '../../utils/db'
import { vendorClaim, vendorClaimItem, claim, claimHistory } from '../../database/schema'
import { z } from 'zod'
import { eq, inArray } from 'drizzle-orm'

// Schema for input
const createVendorClaimSchema = z.object({
    vendorId: z.number().int().positive(),
    claimIds: z.array(z.number().int().positive()).min(1, 'At least one claim is required'),
    submittedAt: z.string().datetime(), // ISO Date
    createdBy: z.number().int().positive() // Should come from auth in real app
})

export default defineEventHandler(async (event) => {
    try {
        const body = await readValidatedBody(event, createVendorClaimSchema.parse)

        const now = new Date().toISOString()
        const dateStr = now.slice(0, 10).replace(/-/g, '')
        const startNo = Math.floor(1000 + Math.random() * 9000)
        const vendorClaimNo = `VC-${dateStr}-${startNo}`

        const result = await db.transaction(async (tx) => {
            // 1. Verify claims
            const claimsToCheck = await tx
                .select()
                .from(claim)
                .where(inArray(claim.id, body.claimIds))

            if (claimsToCheck.length !== body.claimIds.length) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'One or more claims not found'
                })
            }

            // Verify Vendor match
            const invalidVendor = claimsToCheck.find(c => c.vendorId !== body.vendorId)
            if (invalidVendor) {
                throw createError({
                    statusCode: 400,
                    statusMessage: `Claim ${invalidVendor.claimNumber} does not belong to vendor ${body.vendorId}`
                })
            }

            // 2. Create Snapshot (Simple summary)
            const snapshot = JSON.stringify({
                totalClaims: body.claimIds.length,
                claimNumbers: claimsToCheck.map(c => c.claimNumber)
            })

            // 3. Insert Vendor Claim Header
            const newVendorClaim = await tx
                .insert(vendorClaim)
                .values({
                    vendorClaimNo,
                    vendorId: body.vendorId,
                    submittedAt: body.submittedAt,
                    reportSnapshot: snapshot,
                    createdBy: body.createdBy,
                    createdAt: now,
                    updatedAt: now
                })
                .returning()

            if (!newVendorClaim[0]) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Failed to create vendor claim record'
                })
            }

            const vendorClaimId = newVendorClaim[0].id

            // 4. Insert Items
            const itemsToInsert = body.claimIds.map(claimId => ({
                vendorClaimId,
                claimId,
                vendorDecision: 'PENDING' as const,
                decisionAt: now,
                note: ''
            }))

            await tx.insert(vendorClaimItem).values(itemsToInsert)

            // 5. Log History for each claim
            const historyInserts = body.claimIds.map(claimId => ({
                claimId,
                action: 'GENERATE_VENDOR_CLAIM' as const,
                fromStatus: 'APPROVED' as const,
                toStatus: 'APPROVED' as const,
                userId: body.createdBy,
                userRole: 'ADMIN' as const,
                note: `Generated Vendor Claim ${vendorClaimNo}`,
                createdAt: now
            }))

            await tx.insert(claimHistory).values(historyInserts)

            return newVendorClaim[0]
        })

        return {
            success: true,
            data: result,
            message: 'Vendor claim created successfully'
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
            statusMessage: 'Failed to create vendor claim',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
