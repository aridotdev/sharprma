<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { authClient } from '~/utils/auth-client'

definePageMeta({
  layout: false
})

useSeoMeta({
  title: 'Profile — RMA Claim System',
  description: 'Lihat dan kelola profil pengguna'
})

// ========================================
// TYPES
// ========================================

interface ProfileData {
  id: string
  name: string
  email: string
  role: string | null
  branch: string | null
  isActive: boolean
  image: string | null
  createdAt: string
}

// ========================================
// STATE
// ========================================

const toast = useToast()

// Fetch profile from server API (includes additionalFields: branch, isActive)
const {
  data: profile,
  refresh: refreshProfile
} = await useFetch<ProfileData>('/api/profile')

// ========================================
// EDIT NAME
// ========================================

const nameSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter')
})
type NameSchema = z.output<typeof nameSchema>

const nameState = reactive({
  name: profile.value?.name ?? ''
})
const isUpdatingName = ref(false)

async function onUpdateName(payload: FormSubmitEvent<NameSchema>) {
  isUpdatingName.value = true
  try {
    await $fetch('/api/profile', {
      method: 'PUT',
      body: { name: payload.data.name }
    })
    await refreshProfile()
    toast.add({
      title: 'Nama berhasil diperbarui',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  } catch {
    toast.add({
      title: 'Gagal memperbarui nama',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    isUpdatingName.value = false
  }
}

// ========================================
// CHANGE PASSWORD
// ========================================

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Password baru dan konfirmasi tidak sama',
  path: ['confirmPassword']
})
type PasswordSchema = z.output<typeof passwordSchema>

const passwordState = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const isChangingPassword = ref(false)

async function onChangePassword(payload: FormSubmitEvent<PasswordSchema>) {
  isChangingPassword.value = true
  try {
    await $fetch('/api/profile/change-password', {
      method: 'POST',
      body: {
        currentPassword: payload.data.currentPassword,
        newPassword: payload.data.newPassword,
        confirmPassword: payload.data.confirmPassword
      }
    })
    passwordState.currentPassword = ''
    passwordState.newPassword = ''
    passwordState.confirmPassword = ''
    toast.add({
      title: 'Password berhasil diubah',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  } catch (error: unknown) {
    const message = (error as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Gagal mengubah password'
    toast.add({
      title: message,
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    isChangingPassword.value = false
  }
}

// ========================================
// LOGOUT
// ========================================

const isLoggingOut = ref(false)

async function onLogout() {
  isLoggingOut.value = true
  try {
    await authClient.signOut()
    await navigateTo('/login')
  } catch {
    toast.add({
      title: 'Gagal logout',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
    isLoggingOut.value = false
  }
}

// ========================================
// HELPERS
// ========================================

const roleBadgeColor = computed(() => {
  const role = profile.value?.role
  switch (role) {
    case 'ADMIN': return 'error' as const
    case 'QRCC': return 'info' as const
    case 'MANAGEMENT': return 'warning' as const
    case 'CS': return 'success' as const
    default: return 'neutral' as const
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10"
          >
            <UIcon
              name="i-lucide-user-circle"
              class="w-6 h-6 text-primary"
            />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Profile
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Kelola informasi akun Anda
            </p>
          </div>
        </div>

        <UButton
          icon="i-lucide-arrow-left"
          label="Kembali"
          color="neutral"
          variant="ghost"
          :to="profile?.role === 'CS' ? '/cs' : '/dashboard'"
        />
      </div>

      <!-- User Info (Read-only) -->
      <UPageCard
        title="Informasi Akun"
        description="Data utama akun Anda. Hubungi admin untuk mengubah role atau cabang."
        icon="i-lucide-id-card"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Email
            </p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ profile?.email ?? '-' }}
            </p>
          </div>

          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Role
            </p>
            <UBadge
              :color="roleBadgeColor"
              variant="subtle"
              size="sm"
            >
              {{ profile?.role ?? '-' }}
            </UBadge>
          </div>

          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Cabang
            </p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ profile?.branch ?? '-' }}
            </p>
          </div>

          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Status
            </p>
            <UBadge
              :color="profile?.isActive ? 'success' : 'error'"
              variant="subtle"
              size="sm"
            >
              {{ profile?.isActive ? 'Aktif' : 'Tidak Aktif' }}
            </UBadge>
          </div>
        </div>
      </UPageCard>

      <!-- Edit Name -->
      <UPageCard
        title="Ubah Nama"
        description="Perbarui nama tampilan Anda di sistem."
        icon="i-lucide-pencil"
      >
        <UForm
          :schema="nameSchema"
          :state="nameState"
          class="space-y-4"
          @submit="onUpdateName"
        >
          <UFormField
            label="Nama Lengkap"
            name="name"
            required
          >
            <UInput
              v-model="nameState.name"
              placeholder="Masukkan nama lengkap"
              icon="i-lucide-user"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton
              type="submit"
              label="Simpan Nama"
              icon="i-lucide-save"
              :loading="isUpdatingName"
            />
          </div>
        </UForm>
      </UPageCard>

      <!-- Change Password -->
      <UPageCard
        title="Ganti Password"
        description="Untuk keamanan, masukkan password lama sebelum menggantinya."
        icon="i-lucide-lock-keyhole"
      >
        <UForm
          :schema="passwordSchema"
          :state="passwordState"
          class="space-y-4"
          @submit="onChangePassword"
        >
          <UFormField
            label="Password Lama"
            name="currentPassword"
            required
          >
            <UInput
              v-model="passwordState.currentPassword"
              type="password"
              placeholder="Masukkan password lama"
              icon="i-lucide-key-round"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Password Baru"
            name="newPassword"
            required
          >
            <UInput
              v-model="passwordState.newPassword"
              type="password"
              placeholder="Minimal 8 karakter"
              icon="i-lucide-lock"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Konfirmasi Password Baru"
            name="confirmPassword"
            required
          >
            <UInput
              v-model="passwordState.confirmPassword"
              type="password"
              placeholder="Ulangi password baru"
              icon="i-lucide-lock"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton
              type="submit"
              label="Ganti Password"
              icon="i-lucide-shield-check"
              color="warning"
              :loading="isChangingPassword"
            />
          </div>
        </UForm>
      </UPageCard>

      <!-- Logout -->
      <UPageCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              Keluar dari Akun
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Anda akan diarahkan ke halaman login
            </p>
          </div>
          <UButton
            label="Logout"
            icon="i-lucide-log-out"
            color="error"
            variant="soft"
            :loading="isLoggingOut"
            @click="onLogout"
          />
        </div>
      </UPageCard>
    </div>
  </div>
</template>
