import { authClient } from '../lib/auth-client'

/**
 * useAuthSession Composable
 *
 * Provides reactive authentication session state using Better Auth client.
 * This composable wraps Better Auth's useSession hook and provides
 * convenient access to session data, user info, and auth actions.
 *
 * @returns {Object} Auth session state and methods
 */
export const useAuthSession = () => {
  // Better Auth's useSession returns a reactive Ref<SessionResult>
  // This automatically fetches and updates session state
  const sessionResult = authClient.useSession()

  // Extract session data - access reactive value
  const sessionData = computed(() => {
    const result = sessionResult.value
    if (!result) return null
    // Result might be { data: Session } or directly Session
    return result.data || result
  })

  /**
   * Current authenticated user
   * Null if not authenticated
   */
  const user = computed(() => sessionData.value?.user || null)

  /**
   * User's role from user_rma table
   * Possible values: 'ADMIN', 'MANAGEMENT', 'QRCC', 'CS'
   */
  const role = computed(() => user.value?.role || null)

  /**
   * User's branch code
   */
  const branch = computed(() => user.value?.branch || null)

  /**
   * User RMA ID (business user table ID)
   * Different from auth user ID
   */
  const userRmaId = computed(() => user.value?.userRmaId || null)

  /**
   * Whether user account is active
   */
  const isActive = computed(() => user.value?.isActive ?? true)

  /**
   * Authentication status
   */
  const isAuthenticated = computed(() => !!sessionData.value && !!user.value)

  /**
   * Loading state
   */
  const isLoading = ref(false)

  /**
   * Error state
   */
  const error = ref<any>(null)

  /**
   * Refresh session data
   * Call this to manually refresh session from server
   */
  const refreshSession = async () => {
    isLoading.value = true
    error.value = null
    try {
      // Re-fetch session by calling the session endpoint
      const session = await authClient.getSession()
      return session
    } catch (err) {
      console.error('Error refreshing session:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sign out current user
   * Uses Better Auth client's signOut method
   */
  const signOut = async () => {
    isLoading.value = true
    error.value = null
    try {
      await authClient.signOut()
      // After sign out, navigate to login page
      await navigateTo('/auth/login')
    } catch (err) {
      console.error('Sign out error:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check if user has specific role(s)
   * @param roles - Single role string or array of roles
   * @returns true if user has one of the specified roles
   */
  const checkRole = (roles: string | string[]): boolean => {
    if (!role.value) return false
    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    return allowedRoles.includes(role.value)
  }

  /**
   * Check if user is admin
   */
  const isAdmin = computed(() => checkRole('ADMIN'))

  /**
   * Check if user is management
   */
  const isManagement = computed(() => checkRole('MANAGEMENT'))

  /**
   * Check if user is QRCC
   */
  const isQRCC = computed(() => checkRole('QRCC'))

  /**
   * Check if user is CS
   */
  const isCS = computed(() => checkRole('CS'))

  return {
    // Session state
    session: sessionData,
    user,
    role,
    branch,
    userRmaId,
    isActive,
    isAuthenticated,
    isLoading,
    error,

    // Methods
    refreshSession,
    signOut,
    checkRole,

    // Role helpers
    isAdmin,
    isManagement,
    isQRCC,
    isCS
  }
}
