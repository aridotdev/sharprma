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
  // Reactive state
  const session = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<any>(null)

  const { $auth } = useNuxtApp()

  return useAsyncData(
    'auth-session',
    () => $auth.getSession(),
    { server: false }
  )
  /**
   * Fetch current session from server
   */
  const fetchSession = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Better Auth's useSession is a ref, not a function
      const sessionRef = authClient.useSession()

      // Access the ref value
      if (sessionRef?.value) {
        session.value = sessionRef.value
      }
    } catch (err) {
      console.error('Error fetching session:', err)
      error.value = err
      session.value = null
    } finally {
      isLoading.value = false
    }
  }

  // Fetch session on composable creation
  fetchSession()

  /**
   * Reactive session data
   * Contains user info with extended fields (role, branch, userRmaId, isActive)
   */
  const sessionData = computed(() => session.value?.data || session.value)

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
   * Refresh session data
   * Call this to manually refresh session from server
   */
  const refreshSession = async () => {
    await fetchSession()
  }

  /**
   * Sign out current user
   * Uses Better Auth client's signOut method
   */
  const signOut = async () => {
    try {
      await authClient.signOut()
      session.value = null
      // After sign out, navigate to login page
      await navigateTo('/login')
    } catch (err) {
      console.error('Sign out error:', err)
      throw err
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
