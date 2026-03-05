// server/api/profile/index.get.ts

/**
 * GET /api/profile
 * Returns the current authenticated user's profile data from Better-Auth session.
 * Data bisnis (role, branch, isActive) sudah ada di user melalui additionalFields.
 */
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const { id, name, email, role, branch, isActive, image, createdAt } = session.user

  return {
    id,
    name,
    email,
    role,
    branch,
    isActive,
    image,
    createdAt
  }
})
