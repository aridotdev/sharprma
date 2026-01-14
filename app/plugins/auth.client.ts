/**
 * Better Auth Client Plugin
 *
 * Nuxt client plugin to initialize Better Auth client on app startup.
 * Provides auth client globally via $auth for use in composables and components.
 *
 * This plugin only runs on the client side (.client.ts extension).
 */

import { authClient } from '../lib/auth-client'

export default defineNuxtPlugin((nuxtApp) => {
  // Provide auth client globally as $auth
  // This makes it available via useNuxtApp().$auth throughout the app
  nuxtApp.provide('auth', authClient)
})

/**
 * Usage in composables/components:
 *
 * const { $auth } = useNuxtApp()
 * await $auth.signIn.username({ username, password })
 * await $auth.signOut()
 * const session = await $auth.getSession()
 */
