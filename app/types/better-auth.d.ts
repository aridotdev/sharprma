/**
 * Better Auth Type Declarations
 *
 * Extends Better Auth Session and User types with custom user_rma fields.
 * This adds TypeScript support for role, branch, userRmaId, and isActive.
 */

declare module 'better-auth' {
  interface User {
    /**
     * User RMA ID - ID from user_rma business table
     * Different from auth user ID
     */
    userRmaId?: string | number

    /**
     * User's role from user_rma table
     * Possible values: 'ADMIN', 'MANAGEMENT', 'QRCC', 'CS'
     */
    role?: 'ADMIN' | 'MANAGEMENT' | 'QRCC' | 'CS'

    /**
     * User's branch code
     */
    branch?: string

    /**
     * Whether user account is active
     */
    isActive?: boolean
  }
}

declare module 'better-auth/types' {
  interface User {
    /**
     * User RMA ID - ID from user_rma business table
     * Different from auth user ID
     */
    userRmaId?: string | number

    /**
     * User's role from user_rma table
     * Possible values: 'ADMIN', 'MANAGEMENT', 'QRCC', 'CS'
     */
    role?: 'ADMIN' | 'MANAGEMENT' | 'QRCC' | 'CS'

    /**
     * User's branch code
     */
    branch?: string

    /**
     * Whether user account is active
     */
    isActive?: boolean
  }
}

export {}
