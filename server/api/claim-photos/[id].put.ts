import db from '../../utils/db'
import { claimPhoto, updateClaimPhotoSchema } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
    try {
        const params = await getValidatedRouterParams(event, paramsSchema.parse)
        const body = await readValidatedBody(event, updateClaimPhotoSchema.parse)

        const result = await db
            .update(claimPhoto)
            .set({
                ...body,
                updatedAt: new Date().toISOString()
            })
            .where(eq(claimPhoto.id, params.id))
            .returning()

        if (result.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Photo not found'
            })
        }

        return {
            success: true,
            data: result[0],
            message: 'Photo updated successfully'
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
            statusMessage: 'Failed to update photo',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
