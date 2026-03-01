<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { authClient } from '~/utils/auth-client'

definePageMeta({
  layout: false
})

useSeoMeta({
  title: 'Login — RMA Claim System',
  description: 'Masuk ke sistem RMA Claim'
})

// ========================================
// FORM CONFIG
// ========================================

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'nama@perusahaan.com',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Masukkan password',
    required: true
  }
]

const schema = z.object({
  email: z.email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi')
})

type Schema = z.output<typeof schema>

// ========================================
// STATE
// ========================================

const errorMessage = ref<string | null>(null)
const isLoading = ref(false)

// ========================================
// HANDLERS
// ========================================

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  errorMessage.value = null
  isLoading.value = true

  try {
    const { error } = await authClient.signIn.email({
      email: payload.data.email,
      password: payload.data.password
    })

    if (error) {
      errorMessage.value = mapAuthError(error.message ?? 'Login gagal')
      return
    }

    // Fetch profile to determine redirect path
    const { data: profileData } = await useFetch('/api/profile')
    const role = (profileData.value as { role?: string } | null)?.role

    if (role === 'CS') {
      await navigateTo('/cs')
    } else {
      await navigateTo('/dashboard')
    }
  } catch {
    errorMessage.value = 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Map better-auth error messages to user-friendly Indonesian messages
 */
function mapAuthError(message: string): string {
  if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('credentials')) {
    return 'Email atau password salah. Silakan coba lagi.'
  }
  if (message.toLowerCase().includes('too many') || message.toLowerCase().includes('rate limit')) {
    return 'Terlalu banyak percobaan login. Silakan tunggu 15 menit.'
  }
  if (message.toLowerCase().includes('banned') || message.toLowerCase().includes('inactive')) {
    return 'Akun Anda tidak aktif. Hubungi administrator.'
  }
  return message
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <div class="w-full max-w-md space-y-4">
      <!-- Logo / Brand -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <UIcon
            name="i-lucide-shield-check"
            class="w-7 h-7 text-primary"
          />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          RMA Claim System
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Sharp Electronics Indonesia
        </p>
      </div>

      <!-- Auth Form Card -->
      <UPageCard>
        <UAuthForm
          title="Masuk ke Akun"
          description="Gunakan email dan password yang telah diberikan."
          icon="i-lucide-lock"
          :fields="fields"
          :schema="schema"
          :submit="{ label: 'Masuk', block: true, loading: isLoading }"
          :loading="isLoading"
          @submit="onSubmit"
        >
          <!-- Error message slot -->
          <template #validation>
            <UAlert
              v-if="errorMessage"
              color="error"
              variant="soft"
              :title="errorMessage"
              icon="i-lucide-alert-circle"
              class="mt-2"
            />
          </template>
        </UAuthForm>
      </UPageCard>

      <!-- Footer note -->
      <p class="text-center text-xs text-gray-400 dark:text-gray-600">
        Lupa password? Hubungi administrator sistem.
      </p>
    </div>
  </div>
</template>
