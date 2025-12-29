import db from '../../utils/db'
import { vendorPhotoRule, insertVendorPhotoRuleSchema } from '../../database/schema'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
    try {
        const body = await readValidatedBody(event, insertVendorPhotoRuleSchema.parse)

        const now = new Date().toISOString()

        const result = await db
            .insert(vendorPhotoRule)
            .values({
                ...body,
                createdAt: now,
                updatedAt: now
            })
            .returning()

        return {
            success: true,
            data: result[0],
            message: 'Photo rule created successfully'
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
            statusMessage: 'Failed to create photo rule',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
