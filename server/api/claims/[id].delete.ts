import db from '../../utils/db'
import { claim } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
    try {
        const params = await getValidatedRouterParams(event, paramsSchema.parse)

        // Check if exists and status is DRAFT
        const existing = await db
            .select()
            .from(claim)
            .where(eq(claim.id, params.id))
            .limit(1)

        if (existing.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Claim not found'
            })
        }

        const currentClaim = existing[0]

        if (!currentClaim) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Claim not found'
            })
        }

        if (currentClaim.claimStatus !== 'DRAFT' && currentClaim.claimStatus !== 'CANCELLED') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot delete claim that is not DRAFT or CANCELLED'
            })
        }

        const result = await db
            .delete(claim)
            .where(eq(claim.id, params.id))
            .returning()

        return {
            success: true,
            data: result[0],
            message: 'Claim deleted successfully'
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
            statusMessage: 'Failed to delete claim',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
