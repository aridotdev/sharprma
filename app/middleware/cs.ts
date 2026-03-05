// app/middleware/cs.ts
import { authClient } from '~/utils/auth-client'

/**
 * Route middleware for /cs and /cs/** routes.
 * Restricts access to CS role only.
 * Non-CS authenticated users are redirected to their home.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineNuxtRouteMiddleware(async (to) => {
  const headers = useRequestHeaders(['cookie']) as HeadersInit
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers
    }
  })

  if (!session?.user) {
    return navigateTo('/login')
  }

  const role = session.user?.role

  if (role !== 'CS') {
    // Redirect to their proper home based on role
    if (role === 'QRCC' || role === 'MANAGEMENT' || role === 'ADMIN') {
      return navigateTo('/dashboard')
    }
    return navigateTo('/login')
  }
})
