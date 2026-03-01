// server/utils/auth-helpers.ts
import type { H3Event } from 'h3'
import { auth } from '~/server/lib/auth'
import db from '~/server/database/index'
import { profile } from '~/server/database/schema'
import { eq } from 'drizzle-orm'
import type { UserRole } from '~~/shared/utils/constants'

/**
 * Get current user session from H3 event.
 * Returns session object (with user) or null if not authenticated.
 */
export async function getCurrentUser(event: H3Event) {
  const session = await auth.api.getSession({
    headers: event.headers
  })
  return session ?? null
}

/**
 * Require authentication. Throws 401 if not authenticated.
 * Attaches session to event.context.auth for use in route handlers.
 */
export async function requireAuth(event: H3Event) {
  const session = await getCurrentUser(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized — Please log in to access this resource'
    })
  }

  event.context.auth = session
  return session
}

/**
 * Require specific role(s). Throws 401 if not authenticated, 403 if wrong role.
 * Also fetches the business profile and attaches it to event.context.profile.
 *
 * @param event - H3Event
 * @param roles - Allowed roles (any match grants access)
 */
export async function requireRole(event: H3Event, roles: UserRole[]) {
  const session = await requireAuth(event)

  // Fetch business profile from DB to get the role
  const userProfile = await db
    .select()
    .from(profile)
    .where(eq(profile.userAuthId, session.user.id))
    .get()

  if (!userProfile) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden — User profile not found'
    })
  }

  if (!userProfile.isActive) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden — User account is inactive'
    })
  }

  const userRole = userProfile.role as UserRole
  if (!roles.includes(userRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Forbidden — Required role: ${roles.join(' or ')}`
    })
  }

  event.context.profile = userProfile
  return { session, profile: userProfile }
}
