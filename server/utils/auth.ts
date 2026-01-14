import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import db from './db' // your drizzle instance
import { username } from 'better-auth/plugins'
import { userRma } from '../database/schema'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite' // or "mysql", "pg"
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [
    username({
      usernameValidator: (username) => {
        const blockedUsernames = ['root', 'superadmin', 'support', 'admin']
        if (blockedUsernames.includes(username.toLowerCase())) {
          return false
        }
        return true
      },
      displayUsernameValidator: (displayUsername) => {
        // Allow only alphanumeric characters, underscores, and hyphens
        return /^[a-zA-Z0-9_-]+$/.test(displayUsername)
      },
      minUsernameLength: 3,
      maxUsernameLength: 20
    })
  ],
  advanced: {
    database: {
      generateId: false
    },
    useSecureCookies: true,
    cookiePrefix: 'rma_'
  },
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 // 1 hour
    },
    // Extend session with user_rma data
    // This callback is executed when session is fetched
    async onCreate(session: any) {
      return await extendSessionWithUserData(session)
    },
    async getSession(session: any) {
      return await extendSessionWithUserData(session)
    }
  }
})

/**
 * Extend session with user_rma data
 * This function adds role, branch, and userRmaId to the session
 * @param session - Better Auth session object
 * @returns Session with extended user data
 */
export async function extendSessionWithUserData(session: any) {
  if (!session?.user?.id) {
    return session
  }

  try {
    // Fetch user_rma record
    const userRmaRecord = await db
      .select({
        id: userRma.id,
        role: userRma.role,
        branch: userRma.branch,
        isActive: userRma.isActive
      })
      .from(userRma)
      .where(eq(userRma.userAuthId, session.user.id.toString()))
      .limit(1)

    if (userRmaRecord.length > 0 && userRmaRecord[0]) {
      const record = userRmaRecord[0]
      // Add user_rma data to session
      return {
        ...session,
        user: {
          ...session.user,
          userRmaId: record.id,
          role: record.role,
          branch: record.branch,
          isActive: record.isActive
        }
      }
    }

    return session
  } catch (error) {
    console.error('Error extending session with user_rma data:', error)
    return session
  }
}

/**
 * Get current user's branch from auth session
 * @param event - H3 event from request handler
 * @returns User's branch string
 * @throws Error if not authenticated or user not found
 */
export async function getCurrentUserBranch(event: H3Event): Promise<string> {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No active session'
    })
  }

  // Extend session with user_rma data
  const extendedSession = await extendSessionWithUserData(session)

  if (!extendedSession.user.branch) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found in business user table'
    })
  }

  return extendedSession.user.branch
}

/**
 * Get current user with role from auth session
 * @param event - H3 event from request handler
 * @returns User object with id, name, email, username, role, branch, userRmaId
 * @throws Error if not authenticated or user not found
 */
export async function getCurrentUser(event: H3Event) {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No active session'
    })
  }

  // Extend session with user_rma data
  const extendedSession = await extendSessionWithUserData(session)

  if (!extendedSession.user.role) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found in business user table'
    })
  }

  // Return user data needed for API endpoints
  return {
    id: extendedSession.user.id,
    userRmaId: extendedSession.user.userRmaId,
    name: extendedSession.user.name,
    email: extendedSession.user.email,
    username: extendedSession.user.username,
    role: extendedSession.user.role,
    branch: extendedSession.user.branch,
    isActive: extendedSession.user.isActive
  }
}
