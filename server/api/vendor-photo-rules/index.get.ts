import db from '../../utils/db'
import { vendorPhotoRule, vendor } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Query schema for filtering
const querySchema = z.object({
    vendorId: z.coerce.number().int().positive().optional()
})

export default defineEventHandler(async (event) => {
    try {
        const query = await getValidatedQuery(event, querySchema.parse)

        let result

        if (query.vendorId) {
            // Filter by vendorId
            result = await db
                .select({
                    id: vendorPhotoRule.id,
                    vendorId: vendorPhotoRule.vendorId,
                    vendorName: vendor.name,
                    photoType: vendorPhotoRule.photoType,
                    isRequired: vendorPhotoRule.isRequired,
                    createdAt: vendorPhotoRule.createdAt,
                    updatedAt: vendorPhotoRule.updatedAt
                })
                .from(vendorPhotoRule)
                .leftJoin(vendor, eq(vendorPhotoRule.vendorId, vendor.id))
                .where(eq(vendorPhotoRule.vendorId, query.vendorId))
        } else {
            // Get all
            result = await db
                .select({
                    id: vendorPhotoRule.id,
                    vendorId: vendorPhotoRule.vendorId,
                    vendorName: vendor.name,
                    photoType: vendorPhotoRule.photoType,
                    isRequired: vendorPhotoRule.isRequired,
                    createdAt: vendorPhotoRule.createdAt,
                    updatedAt: vendorPhotoRule.updatedAt
                })
                .from(vendorPhotoRule)
                .leftJoin(vendor, eq(vendorPhotoRule.vendorId, vendor.id))
        }

        return {
            success: true,
            data: result
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
            statusMessage: 'Failed to fetch photo rules',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
