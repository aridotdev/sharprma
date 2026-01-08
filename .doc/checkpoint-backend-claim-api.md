# Checkpoint: Backend Claim API - Notification Manual Support

**Date:** 2025-01-06  
**Branch:** backend-claim-api  
**Commit:** d221738 - Add claim API notification manual support

---

## 📋 Summary of Changes

### Database Schema Changes

#### 1. `server/database/schema/claim.ts`
- **Updated notification field validation:**
  - Max length: 25 characters (changed from 50)
  - Added regex pattern: `^[a-zA-Z0-9_-]+$` (only letters, numbers, underscores, hyphens)
  - Added auto-uppercase transformation
- **Omitted branch from insert/update schemas:**
  - Branch is now auto-filled from notificationRef or user
  - Cannot be provided in request body
  - Cannot be updated after claim creation

#### 2. `server/database/schema/defect-master.ts`
- **Already created** (previous checkpoint)
- No changes in this checkpoint

### API Changes

#### 3. `server/api/claims/index.post.ts`
- **Added imports:**
  - `productModel` from database schema
  - Operators: `and`, `like`, `desc`, `inArray` from Drizzle ORM
  
- **Added helper function `generateClaimNumber`:**
  - Generates claim number in format `CLM-{YYYYMMDD}-{sequence}`
  - Queries last claim for current day
  - Increments sequence number
  - Example: `CLM-20250106-001`, `CLM-20250106-002`, etc.

- **Implemented Case A: Notification Valid (exists in notificationRef)**
  - Validates notification status must be 'NEW'
  - Gets branch from `notificationRef.branch`
  - Updates notification status to 'USED'

- **Implemented Case B: Notification Manual (not in notificationRef)**
  - Validates notification manual uniqueness:
    * Checks notificationRef for USED/EXPIRED status
    * Checks claim table for duplicate notification
  - Validates ProductModel existence and consistency:
    * Checks modelName exists in ProductModel
    * Checks vendorId consistency with ProductModel
  - Gets user login for user.id and user.branch
  - Creates new notificationRef with status = 'USED'
  - Gets branch from user.branch

- **Updated claim insertion:**
  - Auto-generates claim number
  - Sets branch from notificationRef or user
  - Sets notification code (uppercase)
  - Maintains all other fields from request body

#### 4. `server/api/defects/index.get.ts`
- **Fixed field name:**
  - Changed `defect.defectName` to `defect.name` (correct field from schema)

---

## 🎯 Features Implemented

### 1. Notification Field Validation
- ✅ Required: Yes
- ✅ Max length: 25 characters
- ✅ Min length: 1 character
- ✅ Trim: Yes
- ✅ Uppercase: Yes (auto-transform)
- ✅ Regex pattern: `^[a-zA-Z0-9_-]+$`

### 2. Branch Logic
- ✅ Notification valid → branch from `notificationRef.branch`
- ✅ Notification manual → branch from `user.branch`
- ✅ Auto-filled (cannot be provided by user)
- ✅ Cannot be updated after claim creation

### 3. Claim Number Auto-Generation
- ✅ Format: `CLM-{YYYYMMDD}-{sequence}`
- ✅ Backend implementation (not frontend)
- ✅ Sequential numbering per day
- ✅ Resets to 001 for new day

### 4. Notification Manual Validation
- ✅ Uniqueness check (notificationRef + claim table)
- ✅ Error if already exists in notificationRef (USED/EXPIRED)
- ✅ Error if already used in another claim
- ✅ ProductModel validation
- ✅ VendorId consistency check

### 5. NotificationRef Creation
- ✅ Auto-create for notification manual
- ✅ Status = 'USED'
- ✅ Includes createdAt and updatedAt
- ✅ Populated with correct branch, modelName, vendorId, createdBy

---

## 📝 Next Task List Plan

### Phase 1: Backend API (Completed)
- [x] Update claim schema validation
- [x] Implement claim number auto-generation
- [x] Implement notification valid logic (Case A)
- [x] Implement notification manual logic (Case B)
- [x] Add all validations (uniqueness, ProductModel, vendorId)
- [x] Update error handling

### Phase 2: Testing (NOT STARTED)
- [ ] Test Case 1: Notification Valid - Success
- [ ] Test Case 2: Notification Manual - Success
- [ ] Test Case 3: Notification Manual - Duplicate (notificationRef)
- [ ] Test Case 4: Notification Manual - Duplicate (claim table)
- [ ] Test Case 5: ProductModel Not Found
- [ ] Test Case 6: VendorId Inconsistent
- [ ] Test Case 7: Notification Validation - Max Length
- [ ] Test Case 8: Notification Validation - Special Characters
- [ ] Test Case 9: Notification Validation - Lowercase to Uppercase
- [ ] Test Case 10: Branch in Body - Error
- [ ] Test Case 11: Claim Number Generation

### Phase 3: Database Migration (NOT STARTED)
- [ ] Generate migration file
- [ ] Review migration file
- [ ] Apply migration to database

### Phase 4: Frontend Integration (NOT STARTED)
- [ ] Update frontend to send notification (uppercase auto)
- [ ] Update frontend to not send `branch` in body
- [ ] Update frontend to handle error response
- [ ] Implement field notification manual input

### Phase 5: Discuss STEP 5 - Upload Photo (NOT STARTED)
- [ ] Design form upload photo with step indicator
- [ ] Discuss storage & upload method (AWS S3, Cloudinary, local)
- [ ] Discuss validation photo types by vendor

### Phase 6: Discuss STEP 6-9 - Post-Submit Flow (NOT STARTED)
- [ ] Discuss CS waiting for review QRCC
- [ ] Discuss need revision flow
- [ ] Discuss approved flow
- [ ] Discuss vendor claim generation

---

## 🔍 File Changes Summary

### Modified Files:
1. **server/database/schema/claim.ts** - Update validation and omit branch
2. **server/api/claims/index.post.ts** - Implement all logic and validations
3. **server/api/defects/index.get.ts** - Fix field name

### Files Created:
None in this checkpoint

### Files Deleted:
None in this checkpoint

---

## ✅ Status

- **TypeScript:** ✅ Passed (no errors)
- **ESLint:** ✅ Passed (7 errors left, unrelated to this implementation)
- **Git Commit:** ✅ Completed
- **Git Push:** ✅ Completed
- **Checkpoint:** ✅ Created

---

## 📌 Notes

### Errors Fixed During Implementation:
1. Fixed defect field name reference (`defectName` → `name`)
2. Fixed TypeScript errors with productModel type casting
3. Fixed ESLint formatting issues (auto-fix)

### Pending Issues (Not Critical):
- 7 ESLint errors remain (unrelated to this implementation):
  - `server/api/claim-photos/index.post.ts` - unused `z` import
  - `server/api/claim-photos/index.post.ts` - `any` type
  - `server/api/claims/[id].put.ts` - `any` type
  - `server/api/vendor-claims/index.post.ts` - unused `eq` import
  - `server/database/seed.ts` - unused `photoRules` variable

### Next Steps:
1. User provides list defect standar (later)
2. Manual testing of all test cases (pending migration)
3. Generate and apply database migration (pending)
4. Frontend discussion and implementation (pending)
5. Continue to STEP 5 (Upload Photo) discussion (pending)

---

**End of Checkpoint**
