// server/utils/loginAttempts.ts

import { createError } from 'h3'

const loginAttempts = new Map<string, {
	count: number
	lockedUntil?: number
}>()

export function checkLoginAttempts(email: string) {
	const attempts = loginAttempts.get(email)

	if (!attempts) return // First attempt

	// Check if locked
	if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
		const remainingMinutes = Math.ceil((attempts.lockedUntil - Date.now()) / 60000)
		throw createError({
			statusCode: 429,
			message: `Account locked. Try again in ${remainingMinutes} minutes.`
		})
	}

	// Reset if lock expired
	if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
		loginAttempts.delete(email)
	}
}

export function recordFailedLogin(email: string) {
	const attempts = loginAttempts.get(email) || { count: 0 }
	attempts.count++

	if (attempts.count >= 5) {
		attempts.lockedUntil = Date.now() + (15 * 60 * 1000) // 15 minutes
	}

	loginAttempts.set(email, attempts)
}

export function recordSuccessLogin(email: string) {
	loginAttempts.delete(email)
}