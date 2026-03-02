// app/middleware/auth.global.ts
import { authClient } from '~/utils/auth-client'

/**
 * Global client-side middleware — runs on every route navigation.
 *
 * Rules:
 * - Unauthenticated + not on /login → redirect to /login
 * - Authenticated + on / or /login → redirect to home by role
 *   - CS → /cs
 *   - QRCC / MANAGEMENT / ADMIN → /dashboard
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  const isLoggedIn = !!session.value?.user
  const isLoginPage = to.path === '/login'
  const isRootPage = to.path === '/'

  // Unauthenticated — redirect to login (except already on login)
  if (!isLoggedIn) {
    if (!isLoginPage) {
      return navigateTo('/login')
    }
    return
  }

  // Authenticated — redirect away from / and /login to correct home
  if (isLoginPage || isRootPage) {
    // Get role from profile via API
    const { data: profileData } = await useFetch('/api/profile')

    const role = (profileData.value as { role?: string } | null)?.role

    if (role === 'CS') {
      return navigateTo('/cs')
    }
    return navigateTo('/dashboard')
  }
})
