// app/middleware/auth.global.ts
import { authClient } from '~/utils/auth-client'

/**
 * Global middleware — runs on every route navigation.
 *
 * Rules:
 * - Unauthenticated + not on /login → redirect to /login
 * - Authenticated + on / or /login → redirect to home by role
 *   - CS → /cs
 *   - QRCC / MANAGEMENT / ADMIN → /dashboard
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Use getSession for stable auth check in middleware
  const { data: session } = await authClient.getSession()

  const isLoggedIn = !!session?.user
  const isLoginPage = to.path === '/login'
  const isRootPage = to.path === '/'

  // 1. Unauthenticated — redirect to login (except already on login)
  if (!isLoggedIn) {
    if (!isLoginPage) {
      return navigateTo('/login')
    }
    return
  }

  // 2. Authenticated — allow /profile for all roles
  const isProfilePage = to.path === '/profile'
  if (isProfilePage) {
    return
  }

  // 3. Authenticated — redirect away from / and /login to correct home
  if (isLoginPage || isRootPage) {
    const role = session.user?.role
    if (role === 'CS') {
      return navigateTo('/cs')
    }
    return navigateTo('/dashboard')
  }
})
