// /plugins/auth.client.ts
import { createAuthClient } from 'better-auth/vue'
import { usernameClient } from 'better-auth/client/plugins'

export default defineNuxtPlugin(() => {
  const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL || '/api/auth',
    plugins: [usernameClient()],
    fetchOptions: {
      credentials: 'include'
    }
  })

  // Make auth client globally available
  const nuxtApp = useNuxtApp()
  nuxtApp.provide('authClient', authClient)

  return {
    provide: {
      authClient
    }
  }
})