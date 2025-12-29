import db from '../../utils/db'
import { claim, insertClaimSchema, notificationRef } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
    try {
        const body = await readValidatedBody(event, insertClaimSchema.parse)

        const now = new Date().toISOString()
        const notificationCode = body.notification

        const result = await db.transaction(async (tx) => {
            // 1. Validate Notification Code if provided
            if (notificationCode) {
                const notif = await tx
                    .select()
                    .from(notificationRef)
                    .where(eq(notificationRef.notificationCode, notificationCode))
                    .limit(1)

                const notification = notif[0]

                if (!notification) {
                    throw createError({
                        statusCode: 404,
                        statusMessage: `Notification code '${notificationCode}' not found`
                    })
                }

                if (notification.status !== 'NEW') {
                    throw createError({
                        statusCode: 400,
                        statusMessage: `Notification code '${notificationCode}' is already ${notification.status}`
                    })
                }

                // 2. Mark Notification as USED
                await tx
                    .update(notificationRef)
                    .set({ status: 'USED' })
                    .where(eq(notificationRef.id, notification.id))
            }

            // 3. Insert Claim
            const insertedCheck = await tx
                .insert(claim)
                .values({
                    ...body,
                    claimStatus: 'DRAFT', // Always start as DRAFT
                    createdAt: now,
                    updatedAt: now
                })
                .returning()

            return insertedCheck[0]
        })

        return {
            success: true,
            data: result,
            message: 'Claim created successfully'
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
        // Handle unique constraint violation for claimNumber
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Claim number already exists',
                data: error.message
            })
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create claim',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
