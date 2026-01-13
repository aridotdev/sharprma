// /composables/useAuthUser.ts
export const useAuthUser = () => {
    const { data: session } = useAuthSession()

    /**
     * Normalized user object
     * Aman walau session null
     */
    const user = computed(() => {
        if (!session.value?.user) return null

        return {
            id: session.value.user.id,
            name: session.value.user.name,
            email: session.value.user.email,
            role: session.value.user.role, // CS | QRCC | MANAGEMENT | ADMIN
        }
    })

    /**
     * Helper flags (optional tapi berguna)
     */
    const isAuthenticated = computed(() => !!user.value)

    const hasRole = (roles: string | string[]) => {
        if (!user.value) return false
        const allowed = Array.isArray(roles) ? roles : [roles]
        return allowed.includes(user.value.role)
    }

    return {
        user,
        isAuthenticated,
        hasRole,
    }
}
