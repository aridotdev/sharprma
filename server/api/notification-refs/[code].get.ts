import db from '../../utils/db'
import { notificationRef, vendor } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
    code: z.string().min(1)
})

export default defineEventHandler(async (event) => {
    try {
        const params = await getValidatedRouterParams(event, paramsSchema.parse)

        const result = await db
            .select({
                id: notificationRef.id,
                notificationCode: notificationRef.notificationCode,
                modelName: notificationRef.modelName,
                vendorId: notificationRef.vendorId,
                vendorName: vendor.name,
                status: notificationRef.status,
                createdBy: notificationRef.createdBy
            })
            .from(notificationRef)
            .leftJoin(vendor, eq(notificationRef.vendorId, vendor.id))
            .where(eq(notificationRef.notificationCode, decodeURIComponent(params.code)))
            .limit(1)

        if (result.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Notification not found'
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
            statusMessage: 'Failed to fetch notification',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
