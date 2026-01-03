import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import db from './db' // your drizzle instance
import { username } from 'better-auth/plugins'

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
