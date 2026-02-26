// shared/utils/constants.ts
// ========================================
// CONSTANTS & TYPES FOR RMA CLAIM SYSTEM
// ========================================
// Source: 10_types.md
// All enums use 'as const' pattern for type safety
// Import these in schema files and validation

// 1. USER ROLES
export const USER_ROLES = [
  'ADMIN', 'MANAGEMENT', 'QRCC', 'CS'
] as const
export type UserRole = (typeof USER_ROLES)[number]

// 2. CLAIM STATUSES
export const CLAIM_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'NEED_REVISION',
  'APPROVED',
  'ARCHIVED'
] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

// 3. PHOTO TYPES
export const PHOTO_TYPES = [
  'CLAIM',
  'CLAIM_ZOOM',
  'ODF',
  'PANEL_SN',
  'WO_PANEL',
  'WO_PANEL_SN'
] as const
export type PhotoType = (typeof PHOTO_TYPES)[number]

// 4. CLAIM PHOTO STATUSES
export const CLAIM_PHOTO_STATUSES = [
  'PENDING', 'VERIFIED', 'REJECT'
] as const
export type ClaimPhotoStatus = (typeof CLAIM_PHOTO_STATUSES)[number]

// 5. CLAIM ACTIONS
export const CLAIM_ACTIONS = [
  'CREATE',
  'SUBMIT',
  'REVIEW',
  'REQUEST_REVISION',
  'APPROVE',
  'CANCEL'
] as const
export type ClaimAction = (typeof CLAIM_ACTIONS)[number]

// 6. CLAIM HISTORY ACTIONS
export const CLAIM_HISTORY_ACTIONS = [
  'CREATE',
  'SUBMIT',
  'REVIEW',
  'APPROVE',
  'REJECT',
  'REQUEST_REVISION',
  'ARCHIVE',
  'UPDATE',
  'UPLOAD_PHOTO',
  'REVIEW_PHOTO',
  'GENERATE_VENDOR_CLAIM',
  'UPDATE_VENDOR_DECISION'
] as const
export type ClaimHistoryAction = (typeof CLAIM_HISTORY_ACTIONS)[number]

// 7. NOTIFICATION STATUSES
export const NOTIFICATION_STATUSES = [
  'NEW', 'USED', 'EXPIRED'
] as const
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number]

// 8. VENDOR DECISIONS
export const VENDOR_DECISIONS = [
  'PENDING', 'ACCEPTED', 'REJECTED'
] as const
export type VendorDecision = (typeof VENDOR_DECISIONS)[number]

// 9. VENDOR CLAIM STATUSES
export const VENDOR_CLAIM_STATUSES = [
  'DRAFT',
  'CREATED',
  'PROCESSING',
  'COMPLETED'
] as const
export type VendorClaimStatus = (typeof VENDOR_CLAIM_STATUSES)[number]

// 10. FIELD NAMES (for Vendor requiredFields)
export const FIELD_NAMES = [
  'odfNumber', 'version', 'week'
] as const
export type FieldName = (typeof FIELD_NAMES)[number]

// 11. SEQUENCE_TYPES (for sequence_generator table)
export const SEQUENCE_TYPES = ['CLAIM', 'VENDOR_CLAIM'] as const
export type SequenceType = typeof SEQUENCE_TYPES[number]

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Check if a value is a valid UserRole
 */
export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole)
}

/**
 * Check if a value is a valid ClaimStatus
 */
export function isClaimStatus(value: string): value is ClaimStatus {
  return CLAIM_STATUSES.includes(value as ClaimStatus)
}

/**
 * Check if a value is a valid PhotoType
 */
export function isPhotoType(value: string): value is PhotoType {
  return PHOTO_TYPES.includes(value as PhotoType)
}

/**
 * Check if a value is a valid ClaimPhotoStatus
 */
export function isClaimPhotoStatus(value: string): value is ClaimPhotoStatus {
  return CLAIM_PHOTO_STATUSES.includes(value as ClaimPhotoStatus)
}

/**
 * Check if a value is a valid NotificationStatus
 */
export function isNotificationStatus(
  value: string
): value is NotificationStatus {
  return NOTIFICATION_STATUSES.includes(value as NotificationStatus)
}

/**
 * Check if a value is a valid VendorDecision
 */
export function isVendorDecision(value: string): value is VendorDecision {
  return VENDOR_DECISIONS.includes(value as VendorDecision)
}

/**
 * Check if a value is a valid VendorClaimStatus
 */
export function isVendorClaimStatus(value: string): value is VendorClaimStatus {
  return VENDOR_CLAIM_STATUSES.includes(value as VendorClaimStatus)
}

/**
 * Check if a value is a valid FieldName
 */
export function isFieldName(value: string): value is FieldName {
  return FIELD_NAMES.includes(value as FieldName)
}

// ========================================
// DEFAULT VALUES
// ========================================

export const DEFAULT_INITIAL_PASSWORD = 'sharp1234'
export const DEFAULT_SESSION_EXPIRY_DAYS = 7
export const FAILED_LOGIN_LOCK_MINUTES = 15
export const MAX_FAILED_LOGIN_ATTEMPTS = 5

// ========================================
// INITIAL VENDOR DATA
// ========================================

export const INITIAL_VENDORS = [
  'MOKA', 'MTC', 'SDP'
] as const
export type InitialVendor = (typeof INITIAL_VENDORS)[number]
