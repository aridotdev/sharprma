import { createAuthClient } from 'better-auth/vue'
import { usernameClient, adminClient } from 'better-auth/client/plugins'

/**
 * Better Auth Client (Vue/Nuxt)
 *
 * Uses better-auth/vue for Nuxt SSR compatibility.
 * Plugins mirror the server-side config.
 */
export const authClient = createAuthClient({
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  plugins: [
    usernameClient(),
    adminClient()
  ]
})

// ========================================
// COMPOSABLE EXPORTS
// ========================================

/**
 * useAuth composable
 * Provides reactive access to current user and auth state
 *
 * @example
 * const { data: session, isPending, error } = useAuth()
 * if (session.value?.user) {
 *   console.log('Logged in as:', session.value.user.email)
 * }
 */
export function useAuth() {
  return authClient.useSession()
}

// ========================================
// TYPE EXPORTS
// ========================================

/**
 * Inferred types from Better-Auth
 * These are auto-generated based on your server configuration
 */
export type AuthUser = typeof authClient.$Infer.Session.user
export type AuthSession = typeof authClient.$Infer.Session
