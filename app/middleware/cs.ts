// app/middleware/cs.ts
// Named middleware — proteksi rute /cs/* hanya untuk role CS
import { authClient } from '~/utils/auth-client'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { data: session } = await authClient.getSession()

  if (!session) {
    return navigateTo('/login')
  }

  const role = session.user?.role

  // Hanya CS yang boleh akses rute /cs/*
  if (role !== 'CS') {
    return navigateTo('/dashboard')
  }
})
