// /composables/useAuthUser.ts
import { useAuthSession } from './useAuthSession'

/**
 * useAuthUser Composable
 *
 * Simplified auth user composable that wraps useAuthSession
 * and provides a cleaner API for user-related operations.
 *
 * For advanced features (signOut, refresh, role checks), use useAuthSession directly.
 */
export const useAuthUser = () => {
  const {
    user,
    role,
    branch,
    isAuthenticated,
    isLoading,
    checkRole,
    signOut
  } = useAuthSession()

  /**
   * Normalized user object
   * Safe to use even when session is null
   */
  const normalizedUser = computed(() => {
    if (!user.value) return null

    return {
      id: user.value.id,
      userRmaId: user.value.userRmaId,
      name: user.value.name,
      email: user.value.email,
      username: user.value.username,
      role: user.value.role, // 'ADMIN' | 'MANAGEMENT' | 'QRCC' | 'CS'
      branch: user.value.branch,
      isActive: user.value.isActive
    }
  })

  /**
   * Helper: Check if user has specific role(s)
   * Alias for checkRole from useAuthSession
   */
  const hasRole = (roles: string | string[]) => {
    return checkRole(roles)
  }

  return {
    user: normalizedUser,
    role,
    branch,
    isAuthenticated,
    isLoading,
    hasRole,
    signOut
  }
}

/**
 * Type definition for normalized user object
 */
export type AuthUser = ReturnType<typeof useAuthUser>['user']['value']


