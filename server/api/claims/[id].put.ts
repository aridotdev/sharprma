import db from '../../utils/db'
import { claim, claimHistory, updateClaimSchema } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getCurrentUser } from '../../utils/auth'
// import { CLAIM_STATUSES, CLAIM_HISTORY_ACTIONS } from '../../../shared/utils/constant'

// Params schema
const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
})

// Extend update schema to include note for history (userId and userRole will be extracted from session)
const extendedUpdateSchema = updateClaimSchema.extend({
  note: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    // Get current user from session
    const currentUser = await getCurrentUser(event)

    const params = await getValidatedRouterParams(event, paramsSchema.parse)
    const body = await readValidatedBody(event, extendedUpdateSchema.parse)

    // tambah validasi
    if ('branch' in body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Branch cannot be updated'
      })
    }

    // Check if exists
    const existing = await db
      .select()
      .from(claim)
      .where(eq(claim.id, params.id))
      .limit(1)

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Claim not found'
      })
    }

    const currentClaim = existing[0]

    if (!currentClaim) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Claim not found'
      })
    }

    const now = new Date().toISOString()
    const updates: any = { ...body, updatedAt: now }

    // Remove note from updates (history-only field)
    delete updates.note

    let historyRecord = null

    // Handle Status Transition
    if (body.claimStatus && body.claimStatus !== currentClaim.claimStatus) {
      const fromStatus = currentClaim.claimStatus
      const toStatus = body.claimStatus

      // Determine action based on transition
      let action = 'UPDATE'
      if (fromStatus === 'DRAFT' && toStatus === 'SUBMITTED') action = 'SUBMIT'
      else if (fromStatus === 'SUBMITTED' && toStatus === 'NEED_REVISION') action = 'REQUEST_REVISION'
      else if (fromStatus === 'SUBMITTED' && toStatus === 'APPROVED') action = 'APPROVE'
      else if (toStatus === 'CANCELLED') action = 'CANCEL'
      else if (body.claimStatus === 'IN_REVIEW') action = 'REVIEW'

      // Create history record with user data from session
      historyRecord = {
        claimId: params.id,
        action,
        fromStatus,
        toStatus,
        userId: currentUser.userRmaId,
        userRole: currentUser.role,
        note: body.note || '',
        createdAt: now
      }
    }

    // Transaction
    const result = await db.transaction(async (tx) => {
      // Update claim
      const updated = await tx
        .update(claim)
        .set(updates)
        .where(eq(claim.id, params.id))
        .returning()

      // Insert history if needed
      if (historyRecord) {
        await tx.insert(claimHistory).values(historyRecord)
      }

      return updated[0]
    })

    return {
      success: true,
      data: result,
      message: 'Claim updated successfully'
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
      statusMessage: 'Failed to update claim',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
