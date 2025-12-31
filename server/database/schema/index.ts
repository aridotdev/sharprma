// Table exports
export * from './claim-history'
export * from './claim-photo'
export * from './claim'
export * from './notification-ref'
export * from './photo-review'
export * from './product-model'
export * from './user-rma'
export * from './vendor-claim-item'
export * from './vendor-claim'
export * from './vendor-field-rule'
export * from './vendor-photo-rule'
export * from './vendor'

// Re-exports are handled by export * from './file' pattern below
// Only shared constants are explicitly re-exported at the end

// Enum exports
export type {
  UserRole,
  PhotoType,
  FieldName,
  ClaimStatus,
  ClaimPhotoStatus,
  ClaimHistoryAction,
  NotificationStatus,
  VendorDecision
} from '../../../shared/utils/constant'

// Constants exports
export {
  USER_ROLES,
  PHOTO_TYPES,
  FIELD_NAMES,
  CLAIM_STATUSES,
  CLAIM_PHOTO_STATUSES,
  CLAIM_HISTORY_ACTIONS,
  NOTIFICATION_STATUSES,
  VENDOR_DECISIONS
} from '../../../shared/utils/constant'
