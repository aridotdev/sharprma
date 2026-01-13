export default defineNuxtRouteMiddleware(() => {
    const user = useAuthUser()

    // 1. Belum login → login page
    if (!user.value) {
        return navigateTo('/auth/login')
    }

    // 2. Role-based redirect
    if (user.value.role === 'CS') {
        return navigateTo('/cs')
    }

    return navigateTo('/dashboard')
})
