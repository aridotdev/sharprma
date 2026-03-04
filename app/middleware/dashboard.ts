// app/middleware/dashboard.ts
// Named middleware — proteksi rute /dashboard/* untuk role QRCC, MANAGEMENT, ADMIN
import { authClient } from '~/utils/auth-client'

const DASHBOARD_ROLES = ['QRCC', 'MANAGEMENT', 'ADMIN']

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { data: session } = await authClient.getSession()

  if (!session) {
    return navigateTo('/login')
  }

  const role = session.user?.role

  // Hanya QRCC, MANAGEMENT, ADMIN yang boleh akses dashboard
  if (!role || !DASHBOARD_ROLES.includes(role)) {
    return navigateTo('/cs')
  }
})
