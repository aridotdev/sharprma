import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import db from './db' // your drizzle instance
import { username } from 'better-auth/plugins'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite' // or "mysql", "pg"
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username()
  ],
  advanced: {
    database: {
      generateId: false
    }
  },
  session: {
    expiresIn: 60 * 60 * 24  // 1 day
  }
})
