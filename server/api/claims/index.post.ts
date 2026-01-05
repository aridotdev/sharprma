import db from '../../utils/db'
import { claim, insertClaimSchema, notificationRef, userRma } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const rawBody = await readBody(event)

    // 1. Validate that branch is not in body (auto-filled)
    if ('branch' in rawBody) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Branch is auto-filled and cannot be provided'
      })
    }

    const body = await readValidatedBody(event, insertClaimSchema.parse)

    const now = new Date().toISOString()
    const notificationCode = body.notification

    const result = await db.transaction(async (tx) => {
      let claimBranch: string

      // 2. Cek apakah notification ada di notificationRef
      const existingNotification = await tx
        .select()
        .from(notificationRef)
        .where(eq(notificationRef.notificationCode, notificationCode || ''))
        .limit(1)

      if (existingNotification.length > 0) {
        // Case A: Notification exists
        const notification = existingNotification[0]
        if (!notification) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Notification not found'
          })
        }

        // validate status must be NEW
        if (notification.status !== 'NEW') {
          throw createError({
            statusCode: 400,
            statusMessage: `Notification code '${notificationCode}' is already ${notification.status}`
          })
        }

        // get branch from notification
        claimBranch = notification.branch

        // used notification status to USED
        await tx
          .update(notificationRef)
          .set({ status: 'USED' })
          .where(eq(notificationRef.id, notification.id))
      } else {
        // Case B: Notification does not exist (Manual Entry)
        // get branch from current user
        const session = await auth.api.getSession({ headers: event.headers })

        if (!session) {
          throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
          })
        }

        const user = await db
          .select({ id: userRma.id, branch: userRma.branch })
          .from(userRma)
          .where(eq(userRma.userAuthId, session.user.id))
          .limit(1)

        if (!user[0]) {
          throw createError({
            statusCode: 404,
            statusMessage: 'User not found in business user table'
          })
        }

        claimBranch = user[0].branch

        // Create new notificationRef with status USED
        await tx.insert(notificationRef).values({
          notificationCode: notificationCode.toUpperCase(),
          modelName: body.modelName,
          branch: user[0].branch,
          vendorId: body.vendorId,
          status: 'USED',
          createdBy: user[0].id
        })
      }

      // 3. Insert Claim data with claimBranch
      const insertedClaim = await tx
        .insert(claim)
        .values({
          ...body,
          branch: claimBranch,
          claimStatus: 'DRAFT', // Always start as DRAFT
          createdAt: now,
          updatedAt: now
        })
        .returning()

      return insertedClaim[0]
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
