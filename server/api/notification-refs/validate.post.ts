import db from '../../utils/db'
import { notificationRef, vendor } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Input schema
const inputSchema = z.object({
    code: z.string().min(1, 'Notification code is required')
})

export default defineEventHandler(async (event) => {
    try {
        const body = await readValidatedBody(event, inputSchema.parse)

        // Find notification
        const result = await db
            .select({
                id: notificationRef.id,
                notificationCode: notificationRef.notificationCode,
                modelName: notificationRef.modelName,
                vendorId: notificationRef.vendorId,
                vendorName: vendor.name,
                status: notificationRef.status,
            })
            .from(notificationRef)
            .leftJoin(vendor, eq(notificationRef.vendorId, vendor.id))
            .where(eq(notificationRef.notificationCode, body.code))
            .limit(1)

        if (result.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Notification code not found'
            })
        }

        const notif = result[0]

        if (!notif) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Notification code not found'
            })
        }

        // Validate status
        if (notif.status !== 'NEW') {
            throw createError({
                statusCode: 400,
                statusMessage: `Notification code is ${notif.status} (already used or expired)`
            })
        }

        return {
            success: true,
            data: notif,
            message: 'Notification code is valid'
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
            statusMessage: 'Failed to validate notification',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
