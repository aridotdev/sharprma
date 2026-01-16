// daftar notification status
export const NOTIFICATION_STATUSES = ['NEW', 'USED', 'EXPIRED'] as const
export type NotificationStatus = typeof NOTIFICATION_STATUSES[number]

// daftar claim photo status
export const CLAIM_PHOTO_STATUSES = ['PENDING', 'VERIFIED', 'REJECT'] as const
export type ClaimPhotoStatus = typeof CLAIM_PHOTO_STATUSES[number]

