// server/middleware/auth.ts
import { auth } from '~/server/lib/auth'

/**
 * Global server middleware — runs on every API request.
 *
 * - Skips /api/auth/* (Better-Auth handles its own routes)
 * - Attaches session to event.context.auth if authenticated
 *
 * Note: This middleware only attaches the session context.
 * Route-specific protection should use requireAuth() / requireRole()
 * from server/utils/auth-helpers.ts.
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Pass through Better-Auth internal routes
  if (url.pathname.startsWith('/api/auth')) {
    return
  }

  // Only process /api routes
  if (!url.pathname.startsWith('/api')) {
    return
  }

  // Attach session to context if available (non-blocking — no throw)
  const session = await auth.api.getSession({
    headers: event.headers
  })

  if (session) {
    event.context.auth = session
  }
})
