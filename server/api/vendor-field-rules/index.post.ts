import db from '../../utils/db'
import { vendorFieldRule, insertVendorFieldRuleSchema } from '../../database/schema'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
    try {
        const body = await readValidatedBody(event, insertVendorFieldRuleSchema.parse)

        const now = new Date().toISOString()

        const result = await db
            .insert(vendorFieldRule)
            .values({
                ...body,
                createdAt: now,
                updatedAt: now
            })
            .returning()

        return {
            success: true,
            data: result[0],
            message: 'Field rule created successfully'
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
            statusMessage: 'Failed to create field rule',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
