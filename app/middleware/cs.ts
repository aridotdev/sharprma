// app/middleware/cs.ts
import { authClient } from '~/utils/auth-client'

/**
 * Route middleware for /cs and /cs/** routes.
 * Restricts access to CS role only.
 * Non-CS authenticated users are redirected to their home.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineNuxtRouteMiddleware(async (to) => {
  // Only runs on /cs/* routes (applied via definePageMeta in pages)
  const { data: session } = await authClient.useSession(useFetch)

  if (!session.value?.user) {
    return navigateTo('/login')
  }

  const { data: profileData } = await useFetch('/api/profile')
  const role = (profileData.value as { role?: string } | null)?.role

  if (role !== 'CS') {
    // Redirect to their proper home based on role
    if (role === 'QRCC' || role === 'MANAGEMENT' || role === 'ADMIN') {
      return navigateTo('/dashboard')
    }
    return navigateTo('/login')
  }
})
