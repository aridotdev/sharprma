import db from '../../utils/db'
import { claim, insertClaimSchema, notificationRef, productModel } from '../../database/schema'
import { eq, and, like, desc, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { getCurrentUser } from '../../utils/auth'

async function generateClaimNumber(db: any): Promise<string> {
  const today = new Date()
  const dateStr = today.getFullYear().toString()
    + (today.getMonth() + 1).toString().padStart(2, '0')
    + today.getDate().toString().padStart(2, '0')

  const prefix = `CLM-${dateStr}`

  const lastClaim = await db
    .select({ claimNumber: claim.claimNumber })
    .from(claim)
    .where(like(claim.claimNumber, `${prefix}-%`))
    .orderBy(desc(claim.claimNumber))
    .limit(1)

  let sequence = 1

  if (lastClaim.length > 0) {
    const lastClaimNumber = lastClaim[0].claimNumber
    const lastSequence = parseInt(lastClaimNumber.split('-')[2], 10)
    sequence = lastSequence + 1
  }

  const sequenceStr = sequence.toString().padStart(3, '0')

  return `${prefix}-${sequenceStr}`
}

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
    const notificationCode = body.notification.toUpperCase()

    // Get current user early (needed for manual entry case)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const currentUser = await getCurrentUser(event)

    const result = await db.transaction(async (tx) => {
      // 2. Generate claim number
      const claimNumber = await generateClaimNumber(db)

      let claimBranch: string

      // 3. Cek apakah notification ada di notificationRef
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

        // 3a. Validate notification manual uniqueness
        // Check notificationRef for USED/EXPIRED status
        const existingNotificationRefUsed = await tx
          .select()
          .from(notificationRef)
          .where(
            and(
              eq(notificationRef.notificationCode, notificationCode),
              inArray(notificationRef.status, ['USED', 'EXPIRED'])
            )
          )
          .limit(1)

        if (existingNotificationRefUsed.length > 0) {
          throw createError({
            statusCode: 409,
            statusMessage: `Notification code '${notificationCode}' already exists`
          })
        }

        // Check claim table for duplicate notification
        const existingClaim = await tx
          .select()
          .from(claim)
          .where(eq(claim.notification, notificationCode))
          .limit(1)

        if (existingClaim.length > 0) {
          throw createError({
            statusCode: 409,
            statusMessage: `Notification code '${notificationCode}' already used in another claim`
          })
        }

        // 3b. Validate ProductModel & consistency
         const modelResult = await tx
           .select()
           .from(productModel)
           .where(eq(productModel.modelName, body.modelName))
           .limit(1)
         
         if (!modelResult[0]) {
           throw createError({
             statusCode: 404,
             statusMessage: `Model name '${body.modelName}' not found`
           })
         }
         
         if (modelResult[0].vendorId !== body.vendorId) {
          throw createError({
            statusCode: 400,
            statusMessage: `Model name '${body.modelName}' does not match vendorId`
          })
        }

         if ((modelResult[0] as any).vendorId !== body.vendorId) {
          throw createError({
            statusCode: 400,
            statusMessage: `Model name '${body.modelName}' does not match vendorId`
          })
        }

        // 3c. Create new notificationRef with status USED using user from session
        await tx.insert(notificationRef).values({
          notificationCode: notificationCode,
          modelName: body.modelName,
          branch: currentUser.branch,
          vendorId: body.vendorId,
          status: 'USED',
          createdBy: currentUser.userRmaId
        })

        claimBranch = currentUser.branch
      }

      // 4. Insert Claim
      const insertedClaim = await tx
        .insert(claim)
        .values({
          ...body,
          notification: notificationCode,
          claimNumber,
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
