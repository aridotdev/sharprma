// server/api/profile/index.put.ts
import db from '~~/server/database/index'
import { profile } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireAuth } from '~~/server/utils/auth-helpers'

const updateProfileBodySchema = z.object({
  name: z.string().min(1, 'Name is required').trim()
})

/**
 * PUT /api/profile
 * Updates the current authenticated user's name.
 * Role and branch can only be changed by Admin.
 */
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const body = await readValidatedBody(event, updateProfileBodySchema.parse)

  const updatedProfile = await db
    .update(profile)
    .set({ name: body.name })
    .where(eq(profile.userAuthId, session.user.id))
    .returning()
    .get()

  if (!updatedProfile) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Profile not found'
    })
  }

  return updatedProfile
})
