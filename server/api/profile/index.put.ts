// server/api/profile/index.put.ts
import { z } from 'zod'
import { auth } from '~~/server/utils/auth'

const updateNameSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter').trim()
})

/**
 * PUT /api/profile
 * Updates the current authenticated user's name via Better-Auth API.
 * Role dan branch hanya bisa diubah oleh Admin.
 */
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readValidatedBody(event, updateNameSchema.parse)

  // Update user name via Better-Auth server API
  await auth.api.updateUser({
    headers: event.headers,
    body: {
      name: body.name
    }
  })

  return {
    id: session.user.id,
    name: body.name,
    email: session.user.email,
    role: session.user.role,
    branch: session.user.branch
  }
})
