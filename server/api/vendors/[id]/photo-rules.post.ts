import db from '../../../utils/db'
import { vendorPhotoRule, insertVendorPhotoRuleSchema } from '../../../database/schema'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
    try {
        const params = await getValidatedRouterParams(event, paramsSchema.parse)
        const body = await readValidatedBody(event, insertVendorPhotoRuleSchema.parse)

        // Override vendorId from params
        const result = await db
            .insert(vendorPhotoRule)
            .values({
                ...body,
                vendorId: params.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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
