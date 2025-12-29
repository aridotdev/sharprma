import db from '../../utils/db'
import { claimPhoto } from '../../database/schema'
import { z } from 'zod'
import { promises as fs } from 'fs'
import path from 'path'

// Helper function to generate ID
const createId = () => Math.random().toString(36).substring(2, 15)

export default defineEventHandler(async (event) => {
    try {
        // Handle multipart form data
        const formData = await readMultipartFormData(event)

        if (!formData || formData.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No file uploaded'
            })
        }

        const file = formData.find(f => f.name === 'file')
        const claimIdInfo = formData.find(f => f.name === 'claimId')
        const photoTypeInfo = formData.find(f => f.name === 'photoType')

        if (!file || !file.filename || !file.data) {
            throw createError({
                statusCode: 400,
                statusMessage: 'File is required'
            })
        }

        if (!claimIdInfo || !photoTypeInfo) {
            throw createError({
                statusCode: 400,
                statusMessage: 'claimId and photoType are required'
            })
        }

        const claimId = parseInt(claimIdInfo.data.toString())
        const photoType = photoTypeInfo.data.toString()
        const now = new Date().toISOString()

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'claims')
        await fs.mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        // Basic sanitization
        const ext = path.extname(file.filename)
        const newFilename = `${claimId}_${photoType}_${createId()}${ext}`
        const filePath = path.join(uploadDir, newFilename)
        const publicPath = `/uploads/claims/${newFilename}`

        // Write file
        await fs.writeFile(filePath, file.data)

        // Insert into DB
        const result = await db
            .insert(claimPhoto)
            .values({
                claimId,
                photoType: photoType as any,
                filePath: publicPath,
                status: 'PENDING',
                createdAt: now,
                updatedAt: now
            })
            .returning()

        return {
            success: true,
            data: result[0],
            message: 'Photo uploaded successfully'
        }
    } catch (error) {
        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to upload photo',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
