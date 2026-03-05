// server/api/profile/change-password.post.ts
import { z } from 'zod'
import { auth } from '~~/server/utils/auth'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Password baru dan konfirmasi tidak sama',
  path: ['confirmPassword']
})

/**
 * POST /api/profile/change-password
 * Changes the current authenticated user's password via Better-Auth API.
 */
export default defineEventHandler(async (event) => {
  // Ensure user is authenticated
  await requireAuth(event)

  const body = await readValidatedBody(event, changePasswordSchema.parse)

  try {
    await auth.api.changePassword({
      headers: event.headers,
      body: {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
        revokeOtherSessions: false
      }
    })

    return { success: true, message: 'Password berhasil diubah' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengubah password'

    // Better-Auth throws specific errors for wrong current password
    if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('incorrect')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password lama tidak sesuai'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: message
    })
  }
})
