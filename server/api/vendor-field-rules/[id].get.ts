import db from '../../utils/db'
import { vendorFieldRule, vendor } from '../../database/schema'
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
                id: vendorFieldRule.id,
                vendorId: vendorFieldRule.vendorId,
                vendorName: vendor.name,
                fieldName: vendorFieldRule.fieldName,
                isRequired: vendorFieldRule.isRequired,
                createdAt: vendorFieldRule.createdAt,
                updatedAt: vendorFieldRule.updatedAt
            })
            .from(vendorFieldRule)
            .leftJoin(vendor, eq(vendorFieldRule.vendorId, vendor.id))
            .where(eq(vendorFieldRule.id, params.id))
            .limit(1)

        if (result.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Field rule not found'
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
            statusMessage: 'Failed to fetch field rule',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
