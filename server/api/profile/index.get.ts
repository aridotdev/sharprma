// server/api/profile/index.get.ts
import db from '~~/server/database/index'
import { profile } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/profile
 * Returns the current authenticated user's business profile.
 */
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const userProfile = await db
    .select()
    .from(profile)
    .where(eq(profile.userAuthId, session.user.id))
    .get()

  if (!userProfile) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Profile not found'
    })
  }

  return userProfile
})
