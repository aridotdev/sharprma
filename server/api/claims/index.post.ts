import db from '../../utils/db'
import { claim, insertClaimSchema } from '../../database/schema'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
    try {
        const body = await readValidatedBody(event, insertClaimSchema.parse)

        const now = new Date().toISOString()

        // Generate simple unique claim number if not provided or just use what's provided?
        // Schema says claimNumber is required. 
        // For now we trust the input validation, assuming FE generates it or user inputs it.
        // Wait, "Format: CLM-{YYYYMMDD}-{Sequence}" was in plan but I decided to keep it simple.
        // Let's assume the body provides it for now, as validated by schema.

        const result = await db
            .insert(claim)
            .values({
                ...body,
                claimStatus: 'DRAFT', // Always start as DRAFT
                createdAt: now,
                updatedAt: now
            })
            .returning()

        return {
            success: true,
            data: result[0],
            message: 'Claim created successfully'
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Validation error',
                data: error.issues
            })
        }
        // Handle unique constraint violation for claimNumber
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Claim number already exists',
                data: error.message
            })
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create claim',
            data: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})
