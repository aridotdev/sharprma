import db from '../../utils/db'
import { claimPhoto } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { promises as fs } from 'fs'
import path from 'path'

// Params schema
const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
  try {
    const params = await getValidatedRouterParams(event, paramsSchema.parse)

    // Check if exists
    const existing = await db
      .select()
      .from(claimPhoto)
      .where(eq(claimPhoto.id, params.id))
      .limit(1)

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Photo not found'
      })
    }

    const photo = existing[0]

    if (!photo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Photo not found'
      })
    }

    // Only delete file if it exists
    if (photo.filePath) {
      try {
        // Remove leading slash if present in DB path
        const relativePath = photo.filePath.startsWith('/') ? photo.filePath.substring(1) : photo.filePath
        const fullPath = path.join(process.cwd(), 'public', relativePath)
        await fs.unlink(fullPath)
      } catch (err) {
        console.warn('Failed to delete physical file:', err)
        // Continue to delete DB record even if file delete fails
      }
    }

    const result = await db
      .delete(claimPhoto)
      .where(eq(claimPhoto.id, params.id))
      .returning()

    return {
      success: true,
      data: result[0],
      message: 'Photo deleted successfully'
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.issues
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete photo',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
