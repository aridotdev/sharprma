// daftar user role

export const USER_ROLES = ['ADMIN', 'MANAGEMENT', 'QRCC', 'CS'] as const
export type UserRole = typeof USER_ROLES[number]

// daftar claim status
export const CLAIM_STATUSES = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'NEED_REVISION', 'APPROVED', 'CANCELLED'] as const
export type ClaimStatus = typeof CLAIM_STATUSES[number]

// daftar photo type
export const PHOTO_TYPES = ['CLAIM', 'CLAIM_ZOOM', 'ODF', 'PANEL_SN', 'WO_PANEL', 'WO_PANEL_SN'] as const
export type PhotoType = typeof PHOTO_TYPES[number]

// daftar claim photo status
export const CLAIM_PHOTO_STATUSES = ['PENDING', 'VERIFIED', 'REJECT'] as const
export type ClaimPhotoStatus = typeof CLAIM_PHOTO_STATUSES[number]

// daftar claim action
export const CLAIM_ACTIONS = ['CREATE', 'SUBMIT', 'REVIEW', 'REQUEST_REVISION', 'APPROVE', 'CANCEL'] as const
export type ClaimAction = typeof CLAIM_ACTIONS[number]

// daftar claim history action
export const CLAIM_HISTORY_ACTIONS = [
    'CREATE',
    'SUBMIT',
    'REVIEW',
    'APPROVE',
    'REJECT',
    'REQUEST_REVISION',
    'CANCEL',
    'UPDATE',
    'UPLOAD_PHOTO',
    'REVIEW_PHOTO',
    'GENERATE_VENDOR_CLAIM',
    'UPDATE_VENDOR_DECISION'
] as const
export type ClaimHistoryAction = typeof CLAIM_HISTORY_ACTIONS[number]

// daftar notification status
export const NOTIFICATION_STATUSES = ['NEW', 'USED', 'EXPIRED'] as const
export type NotificationStatus = typeof NOTIFICATION_STATUSES[number]

// daftar vendor decision
export const VENDOR_DECISIONS = ['ACCEPTED', 'REJECTED'] as const
export type VendorDecision = typeof VENDOR_DECISIONS[number]

// daftar vendor field rule
export const FIELD_NAMES = ['odfNumber', 'version', 'week'] as const
export type FieldName = typeof FIELD_NAMES[number]
