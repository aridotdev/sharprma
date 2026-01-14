<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'text',
    label: 'Username or Email',
    placeholder: 'Enter your corporate ID or email',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true
  },
  {
    name: 'remember',
    label: 'Remember this device',
    type: 'checkbox'
  }
]

const schema = z.object({
  email: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload.data)
  // TODO: Implement actual login logic
}
</script>

<template>
  <div class="font-display min-h-screen flex flex-col relative overflow-x-hidden bg-slate-200">
    <main class="relative z-10 grow flex flex-col justify-center items-center p-8 sm:py-12">
      <div class="w-full max-w-250 flex flex-col md:flex-row gap-8 items-stretch justify-center max-md:items-center">
        <div class="hidden md:flex flex-col justify-center flex-1 pr-0 md:pr-8 lg:pr-12 text-center md:text-left">
          <div
            class="mb-6 inline-flex self-start items-center justify-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400"
          >
            <UIcon
              name="i-lucide-shield-check"
              class="size-5"
            />
          </div>
          <h1 class="font-inter text-dark dark:text-white tracking-tight text-3xl lg:text-[40px] font-bold leading-[1.2] mb-4">
            Official Portal for <span class="text-primary dark:text-blue-400"> <br>LCD RMA System</span> Management
          </h1>
          <p
            class="text-[#4c669a] dark:text-gray-400 text-base lg:text-lg font-normal leading-relaxed mb-8 max-w-120"
          >
            Manage LCD Panel returns, track claim status, and access detailed information in
            real-time. Designed for internal <span class="text-primary">Sharp Electronics Indonesia</span>.
          </p>
          <div class="grid grid-cols-2 gap-4 max-w-100">
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-circle-check"
                class="size-5 text-primary"
              />
              <div>
                <p class="font-semibold text-[#0d121b] dark:text-white text-sm">
                  Real-time Tracking
                </p>
                <p class="text-[#64748b] dark:text-gray-500 text-xs">
                  Instant status updates
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-database"
                class="size-5 text-primary"
              />
              <div>
                <p class="font-semibold text-[#0d121b] dark:text-white text-sm">
                  Centralized
                </p>
                <p class="text-[#64748b] dark:text-gray-500 text-xs">
                  All in one platform
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Login Form -->
        <div class="w-full max-w-115 shrink-0 md:mx-auto">
          <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-white/50 dark:border-white/5">
            <div class="flex flex-col gap-1 mb-8 text-center md:text-left">
              <h3 class="text-2xl font-bold text-[#0d121b] dark:text-white">
                Welcome Back
              </h3>
              <p class="text-sm text-[#4c669a] dark:text-gray-400">
                Enter your credentials to access your account.
              </p>
            </div>
            <div class="auth-form">
              <UAuthForm
                :schema="schema"
                :fields="fields"
                @submit="onSubmit"
              >
                <template #password-hint>
                  <div class="flex justify-end -mt-2">
                    <a
                      class="text-primary dark:text-blue-400 text-xs font-semibold hover:underline"
                      href="#"
                    >Forgot
                      password?</a>
                  </div>
                </template>
                <template #submit="{ loading }">
                  <UButton
                    type="submit"
                    block
                    :loading="loading"
                    size="lg"
                    class="mt-2"
                  >
                    Sign In
                  </UButton>
                </template>
              </UAuthForm>
            </div>
            <div class="mt-8 pt-6 border-t border-[#e7ebf3] dark:border-gray-700 text-center">
              <p class="text-xs text-primary-500 dark:text-gray-500 mb-2">
                Don't have an account? <a
                  class="text-primary dark:text-blue-400 font-semibold hover:underline"
                  href="#"
                >Contact
                  Support</a>
              </p>
              <p class="text-xs text-primary-500 dark:text-gray-500">
                SEID internal system <br>
                Version 1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 w-full py-6 text-center text-sm text-[#4c669a] dark:text-gray-500 bg-transparent">
      <div class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
        <span class="flex items-center gap-1">
          &copy; 2023 LCD RMA Systems Inc.
        </span>
        <div class="flex gap-6">
          <a
            class="hover:text-primary dark:hover:text-blue-400 transition-colors"
            href="#"
          >Privacy</a>
          <a
            class="hover:text-primary dark:hover:text-blue-400 transition-colors"
            href="#"
          >Terms</a>
          <a
            class="hover:text-primary dark:hover:text-blue-400 transition-colors"
            href="#"
          >Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* @import "tailwindcss"; */
.font-inter {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
}

.glass-panel {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 8px 32px 0 rgba(15, 73, 189, 0.08);
  }

  .dark .glass-panel {
    background: rgba(16, 22, 34, 0.85);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

.auth-form :deep(input[type="text"]),
  .auth-form :deep(input[type="text"]),
  .auth-form :deep(input[type="password"]),
  .auth-form :deep(input[type="email"]) {
    padding: 12px 16px;
  }
</style>
