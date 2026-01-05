import db from '../../utils/db'
import { claim, vendor, user, claimHistory } from '../../database/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

// Params schema
const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
  try {
    const params = await getValidatedRouterParams(event, paramsSchema.parse)

    // Get claim details
    const result = await db
      .select({
        id: claim.id,
        claimNumber: claim.claimNumber,
        notification: claim.notification,
        modelName: claim.modelName,
        vendorId: claim.vendorId,
        vendorName: vendor.name,
        inch: claim.inch,
        branch: claim.branch,
        odfNumber: claim.odfNumber,
        panelSerialNo: claim.panelSerialNo,
        ocSerialNo: claim.ocSerialNo,
        defect: claim.defect,
        version: claim.version,
        week: claim.week,
        claimStatus: claim.claimStatus,
        submittedBy: claim.submittedBy,
        submittedByName: user.name,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt
      })
      .from(claim)
      .leftJoin(vendor, eq(claim.vendorId, vendor.id))
      .leftJoin(user, eq(claim.submittedBy, user.id))
      .where(eq(claim.id, params.id))
      .limit(1)

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Claim not found'
      })
    }

    // Get claim history
    const histories = await db
      .select({
        id: claimHistory.id,
        action: claimHistory.action,
        fromStatus: claimHistory.fromStatus,
        toStatus: claimHistory.toStatus,
        userId: claimHistory.userId,
        userName: user.name,
        userRole: claimHistory.userRole,
        note: claimHistory.note,
        createdAt: claimHistory.createdAt
      })
      .from(claimHistory)
      .leftJoin(user, eq(claimHistory.userId, user.id))
      .where(eq(claimHistory.claimId, params.id))
      .orderBy(desc(claimHistory.createdAt))

    return {
      success: true,
      data: {
        ...result[0],
        history: histories
      }
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
      statusMessage: 'Failed to fetch claim',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
