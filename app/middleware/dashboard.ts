// app/middleware/dashboard.ts
import { authClient } from '~/lib/auth-client'

/**
 * Route middleware for /dashboard and /dashboard/** routes.
 *
 * Access matrix:
 * - /dashboard/**             → QRCC, MANAGEMENT, ADMIN
 * - /dashboard/claims/**      → QRCC, ADMIN only
 * - /dashboard/vendor-claims/**  → QRCC, ADMIN only
 * - /dashboard/master/**      → QRCC, ADMIN only
 * - /dashboard/users          → ADMIN only
 *
 * Unauthorized → redirect to their correct home or /login
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  if (!session.value?.user) {
    return navigateTo('/login')
  }

  const { data: profileData } = await useFetch('/api/profile')
  const role = (profileData.value as { role?: string } | null)?.role

  const isDashboardAllowed = ['QRCC', 'MANAGEMENT', 'ADMIN'].includes(role ?? '')

  if (!isDashboardAllowed) {
    // CS → redirect to /cs
    if (role === 'CS') {
      return navigateTo('/cs')
    }
    return navigateTo('/login')
  }

  const path = to.path

  // /dashboard/users — Admin only
  if (path === '/dashboard/users' && role !== 'ADMIN') {
    return navigateTo('/dashboard')
  }

  // /dashboard/claims/** — QRCC, Admin only
  if (path.startsWith('/dashboard/claims') && !['QRCC', 'ADMIN'].includes(role ?? '')) {
    return navigateTo('/dashboard')
  }

  // /dashboard/vendor-claims/** — QRCC, Admin only
  if (path.startsWith('/dashboard/vendor-claims') && !['QRCC', 'ADMIN'].includes(role ?? '')) {
    return navigateTo('/dashboard')
  }

  // /dashboard/master/** — QRCC, Admin only
  if (path.startsWith('/dashboard/master') && !['QRCC', 'ADMIN'].includes(role ?? '')) {
    return navigateTo('/dashboard')
  }
})
