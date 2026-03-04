// app/middleware/auth.global.ts
// Global auth middleware — jalan di setiap navigasi
// Redirect unauthenticated users ke /login
// Redirect authenticated users dari /login ke halaman sesuai role
import { authClient } from '~/utils/auth-client'

// Rute publik yang tidak memerlukan autentikasi
const PUBLIC_ROUTES = ['/login']

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware di server-side (auth check dilakukan client-side)
  if (import.meta.server) return

  const isPublicRoute = PUBLIC_ROUTES.some(route => to.path === route)

  // Ambil session menggunakan getSession (lebih stabil dari useSession di SSR)
  const { data: session } = await authClient.getSession()

  // Jika tidak ada session dan bukan rute publik → redirect ke login
  if (!session && !isPublicRoute) {
    return navigateTo('/login')
  }

  // Jika sudah login dan mengakses rute publik (login) → redirect sesuai role
  if (session && isPublicRoute) {
    const role = session.user?.role
    if (role === 'CS') {
      return navigateTo('/cs')
    }
    return navigateTo('/dashboard')
  }
})
