import db from '../../utils/db'
import { vendorPhotoRule, insertVendorPhotoRuleSchema } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
    id: z.coerce.number().int().positive()
})

// Update schema (partial)
const updateSchema = insertVendorPhotoRuleSchema.partial()

export default defineEventHandler(async (event) => {
    try {
        const params = await getValidatedRouterParams(event, paramsSchema.parse)
        const body = await readValidatedBody(event, updateSchema.parse)

        // Check if exists
        const existing = await db
            .select()
            .from(vendorPhotoRule)
            .where(eq(vendorPhotoRule.id, params.id))
            .limit(1)

        if (existing.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Photo rule not found'
            })
        }

        const result = await db
            .update(vendorPhotoRule)
            .set({
                ...body,
                updatedAt: new Date().toISOString()
            })
            .where(eq(vendorPhotoRule.id, params.id))
            .returning()

        return {
            success: true,
            data: result[0],
            message: 'Photo rule updated successfully'
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
            statusMessage: 'Failed to update photo rule',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
