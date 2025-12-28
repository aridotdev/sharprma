// Table exports
export * from './claim-history'
export * from './claim-photo'
export * from './claim'
export * from './notification-ref'
export * from './photo-review'
export * from './product-model'
export * from './user'
export * from './vendor-claim-item'
export * from './vendor-claim'
export * from './vendor-field-rule'
export * from './vendor-photo-rule'
export * from './vendor'

// Re-export commonly used schemas and types for convenience
export type {
  InsertVendor,
  SelectVendor,
  UpdateVendor
} from './vendor'

export type {
  ProductModel,
  NewProductModel,
  InsertProductModel,
  SelectProductModel,
  UpdateProductModel
} from './product-model'

export type {
  NotificationRef,
  NewNotificationRef,
  InsertNotificationRef,
  SelectNotificationRef,
  UpdateNotificationRef
} from './notification-ref'

export type {
  InsertUser,
  SelectUser
} from './user'

export type {
  Claim,
  NewClaim,
  InsertClaim,
  SelectClaim,
  UpdateClaim,
  ClaimStatusTransition
} from './claim'

export type {
  ClaimPhoto,
  NewClaimPhoto,
  InsertClaimPhoto,
  SelectClaimPhoto,
  UpdateClaimPhoto
} from './claim-photo'

export type {
  ClaimHistory,
  NewClaimHistory,
  InsertClaimHistory,
  SelectClaimHistory,
  ClaimHistoryCreate
} from './claim-history'

export type {
  PhotoReview,
  NewPhotoReview,
  InsertPhotoReview,
  SelectPhotoReview,
  UpdatePhotoReview,
  PhotoReviewAction
} from './photo-review'

export type {
  VendorClaim,
  NewVendorClaim,
  InsertVendorClaim,
  SelectVendorClaim,
  UpdateVendorClaim,
  VendorClaimSubmission
} from './vendor-claim'

export type {
  VendorClaimItem,
  NewVendorClaimItem,
  InsertVendorClaimItem,
  SelectVendorClaimItem,
  UpdateVendorClaimItem,
  VendorDecisionAction
} from './vendor-claim-item'

// Schema exports for validation
export {
  insertVendorSchema,
  selectVendorSchema,
  updateVendorSchema
} from './vendor'

export {
  insertProductModelSchema,
  selectProductModelSchema,
  updateProductModelSchema
} from './product-model'

export {
  insertNotificationRefSchema,
  selectNotificationRefSchema,
  updateNotificationRefSchema
} from './notification-ref'

export {
  insertUserSchema,
  selectUserSchema
} from './user'

export {
  insertClaimSchema,
  selectClaimSchema,
  updateClaimSchema,
  claimStatusTransitionSchema
} from './claim'

export {
  insertClaimPhotoSchema,
  selectClaimPhotoSchema,
  updateClaimPhotoSchema,
  photoReviewSchema
} from './claim-photo'

export {
  insertClaimHistorySchema,
  selectClaimHistorySchema,
  claimHistoryCreateSchema
} from './claim-history'

export {
  insertPhotoReviewSchema,
  selectPhotoReviewSchema,
  updatePhotoReviewSchema,
  photoReviewActionSchema
} from './photo-review'

export {
  insertVendorClaimSchema,
  selectVendorClaimSchema,
  updateVendorClaimSchema,
  vendorClaimSubmissionSchema
} from './vendor-claim'

export {
  insertVendorClaimItemSchema,
  selectVendorClaimItemSchema,
  updateVendorClaimItemSchema,
  vendorDecisionSchema
} from './vendor-claim-item'

// Enum exports
export type { UserRole } from './user'
export type { PhotoType } from './vendor-photo-rule'
export type { FieldName } from './vendor-field-rule'
export type { ClaimStatus } from './claim'
export type { ClaimPhotoStatus } from './claim-photo'
export type { ClaimHistoryAction } from './claim-history'
export type { PhotoReviewStatus } from './photo-review'
export type { VendorClaimStatus } from './vendor-claim'
export type { VendorDecision } from './vendor-claim-item'

// Constants exports
export { USER_ROLES } from './user'
export { PHOTO_TYPES } from './vendor-photo-rule'
export { FIELD_NAMES } from './vendor-field-rule'
export { CLAIM_STATUSES } from './claim'
export { CLAIM_PHOTO_STATUSES } from './claim-photo'
export { CLAIM_HISTORY_ACTIONS } from './claim-history'
export { PHOTO_REVIEW_STATUSES } from './photo-review'
export { VENDOR_CLAIM_STATUSES } from './vendor-claim'
export { VENDOR_DECISIONS } from './vendor-claim-item'
