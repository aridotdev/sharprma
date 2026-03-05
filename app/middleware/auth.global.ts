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
  // Use getSession for stable auth check in middleware. Pass headers for SSR.
  const headers = useRequestHeaders(['cookie']) as HeadersInit
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers
    }
  })

  const isLoggedIn = !!session?.user
  const isLoginPage = to.path === '/login'
  const isRootPage = to.path === '/'
  const isProfilePage = to.path === '/profile' || to.path === '/profile/'

  console.log(`[Middleware] Path: ${to.path}, LoggedIn: ${isLoggedIn}, Role: ${session?.user?.role}, isProfile: ${isProfilePage}`)

  // 1. Unauthenticated — redirect to login (except already on login)
  if (!isLoggedIn) {
    console.log('[Middleware] Not logged in, redirecting to /login')
    if (!isLoginPage) {
      return navigateTo('/login')
    }
    return
  }

  // 2. Authenticated — allow /profile for all roles
  if (isProfilePage) {
    console.log('[Middleware] Is profile page, allowing')
    return
  }

  // 3. Authenticated — redirect away from / and /login to correct home
  if (isLoginPage || isRootPage) {
    const role = session.user?.role
    console.log('[Middleware] Is login or root page, redirecting to home based on role:', role)
    if (role === 'CS') {
      return navigateTo('/cs')
    }
    return navigateTo('/dashboard')
  }

  console.log('[Middleware] Falling through, allowing')
})
