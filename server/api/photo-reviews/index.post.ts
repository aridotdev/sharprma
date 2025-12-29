import db from '../../utils/db'
import { photoReview, claimPhoto, insertPhotoReviewSchema } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
    try {
        const body = await readValidatedBody(event, insertPhotoReviewSchema.parse)

        const now = new Date().toISOString()

        // Transaction to ensure photo status is updated when review is created
        const result = await db.transaction(async (tx) => {
            // 1. Create review record
            const review = await tx
                .insert(photoReview)
                .values(body)
                .returning()

            // 2. Update claim photo status
            await tx
                .update(claimPhoto)
                .set({
                    status: body.status,
                    reviewNote: body.note || '',
                    updatedAt: now
                })
                .where(eq(claimPhoto.id, body.claimPhotoId))

            return review[0]
        })

        return {
            success: true,
            data: result,
            message: 'Photo review submitted successfully'
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
            statusMessage: 'Failed to submit review',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
