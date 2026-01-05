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
    }
  }
})

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

  const user = await db
    .select({ branch: userRma.branch })
    .from(userRma)
    .where(eq(userRma.userAuthId, session.user.id))
    .limit(1)

  if (!user[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found in business user table'
    })
  }

  return user[0].branch
}
