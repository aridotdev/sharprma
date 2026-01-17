// Table exports
export * from './schema/claim-history'
export * from './schema/claim-photo'
export * from './schema/claim'
export * from './schema/notification-ref'
export * from './schema/photo-review'
export * from './schema/product-model'
export * from './schema/user-rma'
export * from './schema/vendor-claim-item'
export * from './schema/vendor-claim'
export * from './schema/vendor-field-rule'
export * from './schema/vendor-photo-rule'
export * from './schema/vendor'
export * from './schema/auth'
export * from './schema/defect'

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
