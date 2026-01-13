// /composables/useAuthUser.ts
import { useAuthSession } from './useAuthSession'
import { authClient } from '../lib/auth-client'

/**
 * useAuthUser Composable
 *
 * Simplified auth user composable that directly uses useAuthSession
 * without manual state management.
 *
 * For advanced features (refresh, role checks), use useAuthSession directly.
 */
export const useAuthUser = () => {
  const authSession = useAuthSession()

  /**
   * Normalized user object
   * Safe to use even when session is null
   */
  const normalizedUser = computed(() => {
    if (!authSession.user.value) return null

    return {
      id: authSession.user.value.id,
      userRmaId: authSession.user.value.userRmaId,
      name: authSession.user.value.name,
      email: authSession.user.value.email,
      username: authSession.user.value.username,
      role: authSession.user.value.role, // 'ADMIN' | 'MANAGEMENT' | 'QRCC' | 'CS'
      branch: authSession.user.value.branch,
      isActive: authSession.user.value.isActive
    }
  })

  /**
   * Helper: Check if user has specific role(s)
   * Alias for checkRole from useAuthSession
   */
  const hasRole = (roles: string | string[]) => {
    return authSession.checkRole(roles)
  }

  /**
   * Check if user has required role
   * @param requiredRole - Single role string to check
   * @returns true if user has the required role
   */
  const checkRole = (requiredRole: string): boolean => {
    return authSession.checkRole(requiredRole)
  }

  /**
   * Sign out function that directly calls authClient.signOut()
   */
  const signOut = async () => {
    try {
      await authClient.signOut()
      await navigateTo('/auth/login')
    } catch (err) {
      console.error('Sign out error:', err)
      throw err
    }
  }

  return {
    user: normalizedUser,
    role: authSession.role,
    branch: authSession.branch,
    userRmaId: authSession.userRmaId,
    isActive: authSession.isActive,
    isAuthenticated: authSession.isAuthenticated,
    isLoading: authSession.isLoading,
    hasRole,
    checkRole,
    signOut,
    // Role helpers from useAuthSession
    isAdmin: authSession.isAdmin,
    isManagement: authSession.isManagement,
    isQRCC: authSession.isQRCC,
    isCS: authSession.isCS
  }
}

/**
 * Type definition for normalized user object
 */
export type AuthUser = ReturnType<typeof useAuthUser>['user']['value']
