import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username, admin } from 'better-auth/plugins'
import db from '../database/index'
import * as schema from '../database/schema'

/**
 * Better Auth Server Configuration
 *
 * Features (per spec.md section 3.6.2):
 * - Email & Password authentication
 * - Username plugin (display name)
 * - Admin plugin (user management)
 * - Session: 7-day expiry
 * - Rate limiting: 5 attempts per 60s
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day — refresh session age daily
  },
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds
    max: 5 // 5 attempts per window
  },
  plugins: [
    username(),
    admin()
  ]
})

export type Auth = typeof auth
