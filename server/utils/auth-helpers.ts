// server/utils/auth-helpers.ts
import type { H3Event } from 'h3'
import { auth } from './auth'
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
 * Role dan isActive dibaca langsung dari session.user (Better-Auth additionalFields).
 *
 * @param event - H3Event
 * @param roles - Allowed roles (any match grants access)
 */
export async function requireRole(event: H3Event, roles: UserRole[]) {
  const session = await requireAuth(event)

  // Baca role dan isActive langsung dari Better-Auth user (additionalFields)
  const user = session.user

  if (!user.isActive) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden — User account is inactive'
    })
  }

  const userRole = user.role as UserRole
  if (!userRole || !roles.includes(userRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Forbidden — Required role: ${roles.join(' or ')}`
    })
  }

  return { session, user }
}
