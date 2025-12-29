import db from '../../utils/db'
import { claimPhoto, claim } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
    try {
        const params = await getValidatedRouterParams(event, paramsSchema.parse)

        const result = await db
            .select({
                id: claimPhoto.id,
                claimId: claimPhoto.claimId,
                claimNumber: claim.claimNumber,
                photoType: claimPhoto.photoType,
                filePath: claimPhoto.filePath,
                status: claimPhoto.status,
                reviewNote: claimPhoto.reviewNote,
                createdAt: claimPhoto.createdAt,
                updatedAt: claimPhoto.updatedAt
            })
            .from(claimPhoto)
            .leftJoin(claim, eq(claimPhoto.claimId, claim.id))
            .where(eq(claimPhoto.id, params.id))
            .limit(1)

        if (result.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Photo not found'
            })
        }

        return {
            success: true,
            data: result[0]
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
            statusMessage: 'Failed to fetch photo',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
