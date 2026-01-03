# RMA Claim System - Rencana Implementasi Detail

## 📊 Status Overview

- **Progress Saat Ini:** ~40% Complete
- **Backend API:** 80% Complete ✅
- **Frontend UI:** 5% Complete ❌
- **Authentication:** 0% Complete ❌
- **Target Timeline:** 4-6 Minggu
- **Final Goal:** Demo-ready system dengan complete workflow

---

## 🎯 Roadmap Summary

| Phase | Duration | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| **Phase 1** | Week 1-2 | Authentication & Core Forms | Login system, CS claim form |
| **Phase 2** | Week 3-4 | Review & Approval | QRCC dashboard, photo review |
| **Phase 3** | Week 5-6 | Advanced Features | Vendor management, analytics |

---

## 🔴 PRIORITY HIGH (Blockers - 2-3 minggu)

### 1. Setup Authentication System dengan better-auth
**Estimasi:** 3-4 hari | **Status:** ⏳ Pending | **Dependencies:** Environment setup

#### 1.1 Core Configuration
**Files to create:**
- `server/lib/auth.ts` - Better-auth instance dengan drizzle adapter
- `.env` - Environment variables untuk auth
- `lib/auth-client.ts` - Client-side auth configuration

**Detail Implementation:**
```typescript
// server/lib/auth.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "~/utils/db"
import { USER_ROLES } from "~/shared/utils/constant"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  user: {
    modelName: "user",
    additionalFields: {
      role: { type: USER_ROLES, required: true, defaultValue: "CS" },
      isActive: { type: "boolean", defaultValue: true }
    },
    fields: { email: "user_auth_id" }
  },
  session: { expiresIn: 60 * 60 * 24 * 7 }
})
```

**Environment Variables (.env):**
```env
BETTER_AUTH_SECRET=your-32-character-secret-here
BETTER_AUTH_URL=http://localhost:3000
```

#### 1.2 API Endpoints
**Files to create:**
- `server/api/auth/[...all].ts` - Auth handler route

**Integration Points:**
- Map existing user schema ke Better Auth
- Setup session management
- Handle user role assignment

#### 1.3 Client Integration
**Files to create:**
- `composables/useAuth.ts` - Auth composables
- `middleware/auth.global.ts` - Route protection

#### 1.4 User Management
**Files to modify:**
- `server/database/seed.ts` - Add Better Auth users
- `server/api/users/` - User CRUD endpoints

---

### 2. Create CS Claim Form dengan Multi-step Process
**Estimasi:** 5-7 hari | **Status:** ⏳ Pending | **Dependencies:** Auth system

#### 2.1 Stepper Foundation
**Files to create:**
- `components/claims/ClaimFormStepper.vue` - Main stepper container
- `components/claims/ClaimFormSteps.vue` - Step management logic
- `pages/claims/create.vue` - Claim creation page

**Technical Implementation:**
```vue
<template>
  <UStepper v-model="currentStep" :items="claimFormSteps">
    <template #notification>
      <ClaimFormStep1 @next="handleStep1Next" />
    </template>
    <template #details>
      <ClaimFormStep2 @next="handleStep2Next" @back="currentStep--" />
    </template>
    <template #photos>
      <ClaimFormStep3 @next="handleStep3Next" @back="currentStep--" />
    </template>
    <template #review>
      <ClaimFormReview @submit="handleSubmitClaim" @back="currentStep--" />
    </template>
  </UStepper>
</template>
```

#### 2.2 Step 1 - Notification/Model Input
**Files to create:**
- `components/claims/inputs/NotificationInput.vue` - Notification validation
- `components/claims/inputs/ModelNameInput.vue` - Model search
- `components/claims/ClaimFormStep1.vue` - Step 1 container

**API Integration:**
- `GET /api/notification-refs/validate` - Notification validation
- `GET /api/product-models` - Model search autocomplete

#### 2.3 Step 2 - Claim Details
**Files to create:**
- `components/claims/inputs/VendorFieldInput.vue` - Dynamic vendor fields
- `components/claims/inputs/ClaimDataInput.vue` - Core claim data
- `components/claims/ClaimFormStep2.vue` - Step 2 container

**Validation Logic:**
- Zod schema validation berdasarkan vendor rules
- Real-time validation feedback
- Conditional field display

#### 2.4 Step 3 - Photo Upload
**Files to create:**
- `components/claims/photos/PhotoUploadStep.vue` - Multi-photo upload
- `components/claims/photos/PhotoTypeRequirement.vue` - Required photos display
- `components/claims/photos/PhotoPreview.vue` - Image preview component

**File Upload Integration:**
- `POST /api/claim-photos` - Photo upload endpoint
- Progress tracking dan error handling
- File validation (type, size, dimensions)

#### 2.5 Step 4 - Review & Submit
**Files to create:**
- `components/claims/ClaimFormReview.vue` - Final review component
- `components/claims/ClaimFormActions.vue` - Navigation buttons

**Submit Logic:**
- Final validation check
- Claim creation dengan `POST /api/claims`
- Claim history creation
- Redirect ke claim detail page

---

### 3. Build QRCC Photo Review Dashboard
**Estimasi:** 4-5 hari | **Status:** ⏳ Pending | **Dependencies:** CS form complete

#### 3.1 Review Queue Interface
**Files to create:**
- `pages/qrcc/review.vue` - Main review dashboard
- `components/review/ClaimReviewPanel.vue` - Claim review container
- `components/review/ReviewQueue.vue` - Claims pending review

**Features:**
- Filter claims dengan status `SUBMITTED`
- Photo grid layout dengan thumbnail
- Batch review capabilities
- Search dan pagination

#### 3.2 Photo Review Modal
**Files to create:**
- `components/review/PhotoReviewModal.vue` - Modal for photo review
- `components/review/PhotoReviewInterface.vue` - Individual photo review
- `components/review/ReviewActions.vue` - Approve/Reject buttons

**Functionality:**
- Image viewer dengan zoom capabilities
- Reject dengan notes
- Batch approve/reject
- Review status indicators

#### 3.3 Claim Status Management
**Files to modify:**
- `server/api/photo-reviews/index.post.ts` - Photo review logic
- `server/api/claims/[id].put.ts` - Claim status update

**Business Logic:**
- Auto-status calculation (ada REJECT → NEED_REVISION)
- All VERIFIED → APPROVED
- Claim history tracking

---

### 4. Implement File Upload Directory & Storage
**Estimasi:** 1-2 hari | **Status:** ⏳ Pending | **Dependencies:** Photo API ready

#### 4.1 Directory Structure
**Directories to create:**
- `public/uploads/claims/` - Main upload directory
- `public/uploads/claims/temp/` - Temporary upload directory

**File Naming Convention:**
```
{claimId}_{photoType}_{timestamp}.jpg
Example: 123_CLAIM_1703123456789.jpg
```

#### 4.2 Upload Handler Enhancement
**Files to modify:**
- `server/api/claim-photos/index.post.ts` - Enhanced upload logic

**Improvements:**
- File validation (type, size < 5MB)
- Error handling dan cleanup
- Unique filename generation
- Directory creation jika tidak exist

---

### 5. Implement Role-based Authorization Middleware
**Estimasi:** 2-3 hari | **Status:** ⏳ Pending | **Dependencies:** Auth system

#### 5.1 Server-side Protection
**Files to create:**
- `server/utils/auth.ts` - Auth middleware utilities
- `server/middleware/auth.ts` - Global auth middleware

**Implementation:**
```typescript
// server/utils/auth.ts
export async function requireAuth(event: any) {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }
  return session
}

export function requireRole(roles: string[]) {
  return async (event: any) => {
    const session = await requireAuth(event)
    if (!roles.includes(session.user.role)) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" })
    }
    return session
  }
}
```

#### 5.2 Client-side Access Control
**Files to create:**
- `components/layout/RoleBasedNavigation.vue` - Dynamic navigation
- `composables/usePermissions.ts` - Permission utilities

**Route Protection:**
```typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const publicRoutes = ['/login', '/signup']
  if (publicRoutes.includes(to.path)) return
  
  const { data: session } = await authClient.useSession(useFetch)
  if (!session.value) return navigateTo('/login')
  
  // Role-based route protection
  const protectedRoutes = {
    '/qrcc': ['QRCC', 'ADMIN', 'MANAGEMENT'],
    '/management': ['MANAGEMENT', 'ADMIN'],
    '/admin': ['ADMIN']
  }
})
```

---

## 🟡 PRIORITY MEDIUM (Features - 2-3 minggu)

### 6. Create Vendor Claim Management Interface
**Estimasi:** 4-5 hari | **Status:** ⏳ Pending | **Dependencies:** QRCC review complete

#### 6.1 Vendor Claim Generation
**Files to create:**
- `pages/vendor-claims/generate.vue` - Batch claim generation
- `components/vendor/VendorClaimGenerator.vue` - Generator interface
- `components/vendor/ClaimSelector.vue` - Claim selection table

**Features:**
- Filter approved claims per vendor
- Checkbox selection untuk batch generation
- Vendor claim number generation (VC-YYYYMMDD-001)
- Report snapshot creation

#### 6.2 Vendor Decision Interface
**Files to create:**
- `pages/vendor-claims/index.vue` - Vendor claim listing
- `pages/vendor-claims/[id].vue` - Vendor claim detail
- `components/vendor/VendorDecisionInterface.vue` - Decision input

**Functionality:**
- Decision form (ACCEPT/REJECTED)
- Compensation amount input (required untuk ACCEPTED)
- Status tracking dengan timeline
- Notes dan documentation

---

### 7. Build Management Analytics Dashboard
**Estimasi:** 5-6 hari | **Status:** ⏳ Pending | **Dependencies:** Vendor claims data

#### 7.1 Data Visualization
**Files to create:**
- `pages/management/dashboard.vue` - Main dashboard
- `components/charts/ClaimStatusChart.vue` - Status distribution
- `components/charts/VendorPerformance.vue` - Vendor metrics
- `components/charts/TrendAnalysis.vue` - Time-based trends

**Technical Implementation:**
```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <UCard>
      <template #header>Total Claims</template>
      <div class="text-2xl font-bold">{{ stats.totalClaims }}</div>
    </UCard>
    <UCard>
      <template #header>Pending Review</template>
      <div class="text-2xl font-bold text-yellow-600">{{ stats.pendingReview }}</div>
    </UCard>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
    <ClaimStatusChart :data="chartData.status" />
    <VendorPerformance :data="chartData.vendor" />
  </div>
</template>
```

#### 7.2 Reports Interface
**Files to create:**
- `pages/management/reports.vue` - Reports generation
- `components/reports/ReportFilters.vue` - Advanced filtering
- `components/reports/DataTable.vue` - Exportable data table

**Features:**
- Date range selection
- Multi-dimensional filtering
- Export ke CSV/Excel
- Custom report generation

---

### 8. Create Comprehensive Testing Suite
**Estimasi:** 3-4 hari | **Status:** ⏳ Pending | **Dependencies:** All features implemented

#### 8.1 Unit Tests
**Files to create:**
- `tests/api/auth.test.ts` - Auth endpoint tests
- `tests/api/claims.test.ts` - Claim CRUD tests
- `tests/components/ClaimForm.test.ts` - Form component tests
- `tests/utils/validation.test.ts` - Validation utility tests

**Testing Strategy:**
```typescript
// tests/api/claims.test.ts
describe('Claims API', () => {
  test('POST /api/claims - create claim', async () => {
    const claimData = {
      notification: 'TEST001',
      modelName: '2T-C32BD1I',
      // ... other required fields
    }
    
    const response = await $fetch('/api/claims', {
      method: 'POST',
      body: claimData
    })
    
    expect(response.id).toBeDefined()
    expect(response.claimNumber).toMatch(/^RMA-\d{8}-\d{3}$/)
  })
})
```

#### 8.2 Integration Tests
**Files to create:**
- `tests/integration/claim-workflow.test.ts` - End-to-end workflow
- `tests/integration/auth-flow.test.ts` - Authentication flow
- `tests/integration/photo-upload.test.ts` - File upload workflow

---

### 9. Setup Database Seeding & Migration
**Estimasi:** 1-2 hari | **Status:** ⏳ Pending | **Dependencies:** Auth system

#### 9.1 Enhanced Seeding
**Files to modify:**
- `server/database/seed.ts` - Add Better Auth integration

**Enhancements:**
```typescript
// Add Better Auth user creation
const authUsers = [
  { email: 'admin@sharp.com', password: 'admin123', role: 'ADMIN' },
  { email: 'qrcc@sharp.com', password: 'qrcc123', role: 'QRCC' },
  { email: 'cs@sharp.com', password: 'cs123', role: 'CS' },
  { email: 'mgmt@sharp.com', password: 'mgmt123', role: 'MANAGEMENT' }
]

for (const user of authUsers) {
  await auth.api.signUpEmail({
    body: { email: user.email, password: user.password, name: user.role }
  })
}
```

#### 9.2 Migration Management
**Files to create:**
- `scripts/migrate.ts` - Production migration script
- `scripts/backup.ts` - Database backup utility

---

## 🟢 PRIORITY LOW (Polish - 1 minggu)

### 10. Final Integration & Demo Preparation
**Estimasi:** 3-4 hari | **Status:** ⏳ Pending | **Dependencies:** All features complete

#### 10.1 Performance Optimization
**Files to modify:**
- `nuxt.config.ts` - Bundle optimization
- `components/` - Add lazy loading

**Optimizations:**
- Image compression untuk uploaded photos
- Bundle analysis dan tree-shaking
- Component lazy loading
- Database query optimization

#### 10.2 Demo Data & Documentation
**Files to create:**
- `scripts/demo-setup.ts` - Demo scenario generator
- `docs/user-guide.md` - User documentation
- `docs/api-endpoints.md` - API documentation

---

## 📅 Implementation Timeline

### Week 1: Foundation
- **Day 1-2:** Authentication setup (better-auth configuration)
- **Day 3-4:** Role-based middleware + File storage setup
- **Day 5:** Testing auth flow + Fix issues

### Week 2: Core Workflow
- **Day 1-3:** CS Claim Form (Steps 1-2)
- **Day 4-5:** CS Claim Form (Steps 3-4) + Testing

### Week 3: Review System
- **Day 1-2:** QRCC Dashboard基础
- **Day 3-4:** Photo Review Interface
- **Day 5:** Review workflow testing

### Week 4: Advanced Features
- **Day 1-2:** Vendor Claim Management
- **Day 3-4:** Management Dashboard
- **Day 5:** Analytics integration

### Week 5: Quality Assurance
- **Day 1-2:** Testing Suite + Bug fixes
- **Day 3-4:** Performance optimization
- **Day 5:** Documentation finalization

### Week 6: Demo Preparation
- **Day 1-2:** Demo scenario setup
- **Day 3-4:** Final integration testing
- **Day 5:** Demo dry run + Polish

---

## ✅ Success Criteria

### Functional Requirements
- [ ] Complete CS → QRCC → Vendor workflow
- [ ] Role-based authentication dan authorization
- [ ] Photo upload dengan proper validation
- [ ] Claim status tracking dengan history
- [ ] Vendor claim generation dan management

### Technical Requirements
- [ ] All API endpoints tested dengan 80%+ coverage
- [ ] No ESLint atau TypeScript errors
- [ ] Responsive design untuk mobile/desktop
- [ ] Performance: < 2s initial load time
- [ ] Security: Proper input validation dan sanitization

### Demo Requirements
- [ ] Complete demo scenario dengan realistic data
- [ ] User guide documentation
- [ ] API documentation
- [ ] Production-ready configuration

---

## 🔧 Technical Dependencies

### Required Tools & Libraries
- ✅ Already installed: Nuxt 4, Nuxt UI, Drizzle ORM, Better Auth
- ⏳ Need setup: Vitest (testing), Unovis (charts)

### Environment Setup
```bash
# Required environment variables
BETTER_AUTH_SECRET=your-32-character-secret-here
BETTER_AUTH_URL=http://localhost:3000
TURSO_DATABASE_URL=file:local.db

# Additional directories to create
mkdir -p public/uploads/claims
mkdir -p tests/{api,components,integration,utils}
```

---

## 🚀 Getting Started Checklist

### Pre-Implementation
- [x] Review and approve this plan
- [ ] Set up development environment
- [ ] Create necessary directories
- [ ] Configure environment variables

### Implementation Order
1. **Authentication System** (Week 1)
2. **CS Claim Form** (Week 2)
3. **QRCC Review System** (Week 3)
4. **Vendor Management** (Week 4)
5. **Analytics & Testing** (Week 5)
6. **Demo Preparation** (Week 6)

### Post-Implementation
- [ ] User acceptance testing
- [ ] Performance monitoring setup
- [ ] Documentation handover
- [ ] Deployment preparation

---

## 📞 Support & Resources

### Documentation References
- [Nuxt 4 Documentation](https://nuxt.com/)
- [Nuxt UI Components](https://ui.nuxt.com/)
- [Better Auth Guide](https://better-auth.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Vitest Testing](https://vitest.dev/)

### Key Implementation Files
- `AGENTS.md` - System requirements dan workflow
- `shared/utils/constant.ts` - Constants dan types
- `server/database/seed.ts` - Database seeding

---

## 📈 Risk Assessment & Mitigation

### High Risk Items
1. **Authentication Integration** - Complex Better Auth + existing schema
   - **Mitigation:** Test dengan separate branch, backup existing data
   
2. **Photo Upload Performance** - Large files bisa slow down system
   - **Mitigation:** Implement file size limits, compression, CDN jika perlu

3. **Complex Form Validation** - Multi-step form dengan conditional logic
   - **Mitigation:** Modular validation components, comprehensive testing

### Medium Risk Items
1. **Role-based Access Control** - Security implications
   - **Mitigation:** Thorough testing, code review, security audit
   
2. **Performance Scaling** - Growing data volume
   - **Mitigation:** Database indexing, query optimization, lazy loading

---

## 🎯 Next Steps

1. **Review & Approval:** Review this rencana.md dan adjust jika perlu
2. **Environment Setup:** Configure development environment
3. **Start Implementation:** Begin dengan Priority High items
4. **Regular Check-ins:** Weekly progress review
5. **Quality Assurance:** Continuous testing sepanjang development

---

*Last Updated: 2025-12-30*
*Version: 1.0*
*Status: Ready for Implementation*


You are a senior authentication engineer with deep experience in better-auth, Nuxt, and modern web security.

I am building an RMA web application using better-auth.
Your task is to:

1. Verify whether better-auth is correctly configured and available
2. Identify any missing or misconfigured settings

Constraints & context:
- Framework: Nuxt
- Auth library: better-auth
- Auth strategy: session-based
- Role-based routing is used (ADMIN, QRCC, CS, MANAGEMENT)

Output requirements:
- Step-by-step verification checklist
- Clear pass/fail indicators
- Highlight critical issues vs optional improvements
- any misconfigurated setting, do not change anything just give me a list of suggestion to do
- if any suggestion, make it simple words and easy to understand
- Use concise, technical, but easy-to-understand explanations
- stick to this scope, do not do other things.

Assume I want production-ready, secure, and maintainable auth setup.
Do not make assumptions without justification.


- Auth endpoints such as `/get-session` are consumed by frontend middleware
- Hooks may override default responses

1. Verify whether better-auth is correctly configured and available
2. Check whether all required auth endpoints are properly registered and reachable
3. Validate session handling behavior (logged-in vs not logged-in)
4. Ensure middleware and hooks do not break default auth behavior
5. Identify any missing or misconfigured settings

Then:

1. Add and verify the username authentication plugin
2. Ensure username can be used as a primary login credential
3. Check database/schema compatibility for username usage
4. Validate that username is unique, indexed, and safe
1.  Provide any required configuration changes

