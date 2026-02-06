// shared/types/database.ts
// ========================================
// DATABASE TYPE DEFINITIONS
// ========================================
// Inferred types from Drizzle schemas
// Provides type safety for database operations

import type {
  // Master tables
  vendor,
  productModel,
  notificationRef,
  vendorPhotoRule,
  vendorFieldRule,
  defectMaster,

  // Transaction tables
  claim,
  claimPhoto,
  vendorClaim,
  vendorClaimItem,
  claimHistory,
  photoReview,
  sequenceGenerator,

  // User tables
  userRma,

  // Auth tables (better-auth)
  user,
  session,
  account,
  verification
} from '../../server/database/schema/index'

import type {
  // Insert types
  InferInsertModel,
  // Select types
  InferSelectModel
} from 'drizzle-orm'

// ========================================
// MASTER TABLE TYPES
// ========================================

// Vendor
export type Vendor = InferSelectModel<typeof vendor>
export type NewVendor = InferInsertModel<typeof vendor>

// ProductModel
export type ProductModel = InferSelectModel<typeof productModel>
export type NewProductModel = InferInsertModel<typeof productModel>

// NotificationRef
export type NotificationRef = InferSelectModel<typeof notificationRef>
export type NewNotificationRef = InferInsertModel<typeof notificationRef>

// VendorPhotoRule
export type VendorPhotoRule = InferSelectModel<typeof vendorPhotoRule>
export type NewVendorPhotoRule = InferInsertModel<typeof vendorPhotoRule>

// VendorFieldRule
export type VendorFieldRule = InferSelectModel<typeof vendorFieldRule>
export type NewVendorFieldRule = InferInsertModel<typeof vendorFieldRule>

// DefectMaster
export type DefectMaster = InferSelectModel<typeof defectMaster>
export type NewDefectMaster = InferInsertModel<typeof defectMaster>

// ========================================
// TRANSACTION TABLE TYPES
// ========================================

// Claim
export type Claim = InferSelectModel<typeof claim>
export type NewClaim = InferInsertModel<typeof claim>

// ClaimPhoto
export type ClaimPhoto = InferSelectModel<typeof claimPhoto>
export type NewClaimPhoto = InferInsertModel<typeof claimPhoto>

// VendorClaim
export type VendorClaim = InferSelectModel<typeof vendorClaim>
export type NewVendorClaim = InferInsertModel<typeof vendorClaim>

// VendorClaimItem
export type VendorClaimItem = InferSelectModel<typeof vendorClaimItem>
export type NewVendorClaimItem = InferInsertModel<typeof vendorClaimItem>

// ClaimHistory
export type ClaimHistory = InferSelectModel<typeof claimHistory>
export type NewClaimHistory = InferInsertModel<typeof claimHistory>

// PhotoReview
export type PhotoReview = InferSelectModel<typeof photoReview>
export type NewPhotoReview = InferInsertModel<typeof photoReview>

// SequenceGenerator
export type SequenceGenerator = InferSelectModel<typeof sequenceGenerator>
export type NewSequenceGenerator = InferInsertModel<typeof sequenceGenerator>

// ========================================
// USER TABLE TYPES
// ========================================

// UserRma
export type UserRma = InferSelectModel<typeof userRma>
export type NewUserRma = InferInsertModel<typeof userRma>

// ========================================
// AUTH TABLE TYPES
// ========================================

// Auth tables (better-auth)
export type User = InferSelectModel<typeof user>
export type NewUser = InferInsertModel<typeof user>

export type Session = InferSelectModel<typeof session>
export type NewSession = InferInsertModel<typeof session>

export type Account = InferSelectModel<typeof account>
export type NewAccount = InferInsertModel<typeof account>

export type Verification = InferSelectModel<typeof verification>
export type NewVerification = InferInsertModel<typeof verification>

// ========================================
// USER-AUTH RELATIONSHIP TYPES
// ========================================

// User with their business profile
export type UserWithProfile = User & {
  profile?: UserRma
}

// Business profile with auth user
export type UserRmaWithAuth = UserRma & {
  authUser?: User
}

// User with all their related data
export type UserWithAllRelations = UserRma & {
  authUser?: User
  claims?: Claim[]
  notificationRefs?: NotificationRef[]
  claimHistories?: ClaimHistory[]
  vendorClaims?: VendorClaim[]
  photoReviews?: PhotoReview[]
}

// ========================================
// UNION TYPES FOR COMMON OPERATIONS
// ========================================

// All master table types
export type MasterTable
  = | Vendor
    | ProductModel
    | NotificationRef
    | VendorPhotoRule
    | VendorFieldRule
    | DefectMaster

// All transaction table types
export type TransactionTable
  = | Claim
    | ClaimPhoto
    | VendorClaim
    | VendorClaimItem
    | ClaimHistory
    | PhotoReview
    | SequenceGenerator

// All user-related table types
export type UserTable = UserRma | User | Session | Account | Verification

// All table types
export type DatabaseTable = MasterTable | TransactionTable | UserTable

// ========================================
// COMMON TYPE UTILITIES
// ========================================

// Tables with timestamps
export type TimestampedTable
  = | Vendor
    | ProductModel
    | NotificationRef
    | VendorPhotoRule
    | VendorFieldRule
    | DefectMaster
    | Claim
    | ClaimPhoto
    | VendorClaim
    | ClaimHistory
    | PhotoReview
    | SequenceGenerator
    | UserRma

// Tables with status field
export type StatusTable
  = | NotificationRef
    | Claim
    | ClaimPhoto
    | VendorClaim
    | VendorClaimItem
    | UserRma

// Tables that can be soft-deleted
export type SoftDeleteTable
  = | Vendor
    | ProductModel
    | DefectMaster
    | UserRma

// ========================================
// RELATIONSHIP TYPES
// ========================================

// User with their claims (expanded)
export type UserWithClaims = UserRma & {
  claims?: Claim[]
  authUser?: User // ← ADD: auth user relation
}

// Vendor with related data
export type VendorWithRelations = Vendor & {
  productModels?: ProductModel[]
  notificationRefs?: NotificationRef[]
  vendorPhotoRules?: VendorPhotoRule[]
  vendorFieldRules?: VendorFieldRule[]
}

// Claim with all relations
export type ClaimWithRelations = Claim & {
  vendor?: Vendor
  productModel?: ProductModel
  claimPhotos?: ClaimPhoto[]
  vendorClaimItems?: VendorClaimItem[]
  claimHistory?: ClaimHistory[]
  submittedByUser?: UserRma
}

// Claim with photos and reviews
export type ClaimWithPhotos = Claim & {
  claimPhotos?: (ClaimPhoto & {
    reviews?: PhotoReview[]
  })[]
}

// ========================================
// TYPE GUARDS
// ========================================

/**
 * Check if a table has timestamps
 */
export function isTimestampedTable (table: DatabaseTable): table is TimestampedTable {
  return 'createdAt' in table && 'updatedAt' in table
}

/**
 * Check if a table has status field
 */
export function isStatusTable (table: DatabaseTable): table is StatusTable {
  return 'status' in table
}

/**
 * Check if a table supports soft delete
 */
export function isSoftDeleteTable (table: DatabaseTable): table is SoftDeleteTable {
  return 'isActive' in table
}

// ========================================
// SEARCH & FILTER TYPES
// ========================================

// Common search filters
export interface DateRangeFilter {
  startDate?: number
  endDate?: number
}

export interface StatusFilter {
  status?: string
}

export interface PaginationFilter {
  limit?: number
  offset?: number
}

// Combined filter types
export type ClaimFilter = DateRangeFilter
  & StatusFilter
  & PaginationFilter & {
    claimNumber?: string
    vendorId?: number
    submittedBy?: number
    branch?: string
  }

export type VendorFilter = StatusFilter
  & PaginationFilter & {
    name?: string
  }

export type UserFilter = StatusFilter
  & PaginationFilter & {
    role?: string
    branch?: string
    name?: string
  }

// ========================================
// API RESPONSE TYPES
// ========================================

// Standard API response structure
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Export all types for easy importing
export * from '../utils/constants'
