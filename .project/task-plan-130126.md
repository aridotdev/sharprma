# Sharp RMA System - Auth Implementation Plan
**Date:** 2026-01-13
**Focus:** Complete Authentication Backend & Frontend Integration
**Estimated Time:** 3-4 days

---

## 📋 Phase 1: Critical Auth Tasks (Priority 1)

### Backend - Auth Integration
- [x] **Integrate user_rma.role into Better Auth session**
  - [x] Modify Better Auth config to include role in session data
  - [x] Create custom session callback to fetch role from user_rma table
  - [x] Test that role is available in auth.api.getSession()
  - [x] File: [server/utils/auth.ts](server/utils/auth.ts)

- [x] **Create getCurrentUser helper with role**
  - [x] Create server utility to get current user with role from session
  - [x] Return: { id, name, email, username, role, branch }
  - [x] Use in API endpoints instead of reading from request body
  - [x] File: [server/utils/getCurrentUser.ts](server/utils/getCurrentUser.ts) (new)

- [x] **Update API endpoints to use session-based auth**
  - [x] Update PUT /api/claims/[id] - extract userId/userRole from session
  - [x] Update other endpoints that need user context
  - [x] Remove userId/userRole from request body validation
  - [x] Test all updated endpoints

---

### Frontend - Auth Composables
- [x] **Create useAuthSession composable**
  - [x] Use Better Auth client's useSession hook
  - [x] Expose: session, user, role, isAuthenticated, isLoading
  - [x] Implement refreshSession() function
  - [x] Handle session errors gracefully
  - [x] File: [app/composables/useAuthSession.ts](app/composables/useAuthSession.ts) (new)

- [x] **Update useAuthUser composable**
  - [x] Replace manual state with useAuthSession
  - [x] Ensure role is properly exposed
  - [x] Add signOut function that calls authClient.signIn()
  - [x] Add checkRole(requiredRole) utility
  - [x] File: [app/composables/useAuthUser.ts](app/composables/useAuthUser.ts)

---

### Frontend - Auth Plugin
- [x] **Create Better Auth client plugin**
  - [x] Create Nuxt plugin to initialize auth client on app startup
  - [ ] Set up auth client with baseURL
  - [ ] Provide auth client globally via provide()
  - [ ] Handle SSR compatibility
  - [ ] File: [app/plugins/auth.client.ts](app/plugins/auth.client.ts) (new)

alur final :
auth.client.ts
        ↓
useAuthSession()
        ↓
useAuthUser()
        ↓
middleware / menu / page


---

### Frontend - Login Page
- [ ] **Implement login functionality in login.vue**
  - [ ] Get form values (username/email, password)
  - [ ] Call authClient.signIn.username() or authClient.signIn.email()
  - [ ] Handle loading state during authentication
  - [ ] Handle authentication errors (show UAlert)
  - [ ] Redirect to dashboard on success
  - [ ] Validate form before submission
  - [ ] File: [app/pages/login.vue](app/pages/login.vue)

- [ ] **Add login form validation**
  - [ ] Username/email required validation
  - [ ] Password required validation
  - [ ] Show error messages for invalid credentials
  - [ ] Disable submit button during loading

---

### Frontend - Middleware
- [ ] **Create auth.global.ts middleware**
  - [ ] Check session on every route change
  - [ ] Get session using authClient.useSession()
  - [ ] Redirect to /login if not authenticated
  - [ ] Allow public routes: /login, /signup, /
  - [ ] Handle session expiry gracefully
  - [ ] File: [app/middleware/auth.global.ts](app/middleware/auth.global.ts) (new)

- [ ] **Update auth-redirect.ts middleware**
  - [ ] Get user role from session
  - [ ] Define route access by role:
    - [ ] CS: /cs, /claims, /claims/create, /claims/[id]
    - [ ] QRCC: /review, /vendor-claims, /cs
    - [ ] MANAGEMENT: /dashboard (read-only)
    - [ ] ADMIN: all routes
  - [ ] Redirect unauthorized users to appropriate page
  - [ ] Show access denied message
  - [ ] File: [app/middleware/auth-redirect.ts](app/middleware/auth-redirect.ts)

---

### Frontend - Logout Functionality
- [ ] **Implement logout in AppHeader component**
  - [ ] Create logout button in header menu
  - [ ] Call authClient.signOut() on click
  - [ ] Show confirmation dialog before logout
  - [ ] Redirect to /login after successful logout
  - [ ] Handle logout errors
  - [ ] File: [app/components/AppHeader.vue](app/components/AppHeader.vue) (create if needed)

---

### Testing - Auth Flow
- [ ] **Test complete authentication flow**
  - [ ] Test: Sign up → Create user_rma record → Login
  - [ ] Test: Login with username
  - [ ] Test: Login with email
  - [ ] Test: Access protected route without login → redirect to /login
  - [ ] Test: Login → Access dashboard → See correct role
  - [ ] Test: Logout → Redirect to /login
  - [ ] Test: Session expiry → Redirect to /login
  - [ ] Test: Role-based access control (try access other role pages)
  - [ ] Test: API endpoints return 401 without session
  - [ ] Test: API endpoints include user context from session

---

## 📋 Phase 2: High Priority Auth Tasks

### Frontend - Sign Up Page
- [ ] **Create sign up page**
  - [ ] Create /signup page with form
  - [ ] Fields: name, email, username, password, confirm password
  - [ ] Validation: all fields required, password match, email format
  - [ ] Call authClient.signUp.email()
  - [ ] Handle success (redirect to login or auto-login)
  - [ ] Handle errors (show UAlert)
  - [ ] File: [app/pages/signup.vue](app/pages/signup.vue) (new)

- [ ] **Create user_rma record on sign up**
  - [ ] After successful auth user creation
  - [ ] Prompt for additional info: role, branch (or set defaults)
  - [ ] Create user_rma record via API endpoint
  - [ ] Link to auth user via userAuthId
  - [ ] Handle errors

---

### Frontend - Session Management
- [ ] **Add auto session refresh**
  - [ ] Check session expiry before API calls
  - [ ] Refresh session if expiring soon
  - [ ] Handle refresh failures (redirect to login)
  - [ ] Show refresh notification to user

- [ ] **Add session persistence**
  - [ ] Ensure session persists across page reloads
  - [ ] Test session storage
  - [ ] Handle session restoration on app load

---

### Frontend - Error Handling
- [ ] **Create auth error handling**
  - [ ] Show user-friendly error messages
  - [ ] Handle network errors during auth
  - [ ] Handle invalid credentials
  - [ ] Handle session errors
  - [ ] Create useNotification composable for toast messages
  - [ ] File: [app/composables/useNotification.ts](app/composables/useNotification.ts) (new)

---

## 📋 Phase 3: Medium Priority Auth Tasks

### Backend - Additional Auth Features
- [ ] **Add email verification flow**
  - [ ] Configure Better Auth to send verification emails
  - [ ] Create email templates
  - [ ] Handle email verification callback
  - [ ] Show verification status in UI
  - [ ] Resend verification email functionality

- [ ] **Add password reset flow**
  - [ ] Configure Better Auth password reset
  - [ ] Create /forgot-password page
  - [ ] Create /reset-password page with token
  - [ ] Send password reset email
  - [ ] Validate reset token
  - [ ] Update password with validation

- [ ] **Add rate limiting**
  - [ ] Implement rate limiting for login attempts
  - [ ] Implement rate limiting for sign up
  - [ ] Block IP after N failed attempts
  - [ ] Show rate limit error to user

---

### Configuration
- [ ] **Use environment variables for auth config**
  - [ ] Move Better Auth URL to .env
  - [ ] Add APP_URL environment variable
  - [ ] Configure cookie settings via .env
  - [ ] Add session expiry config via .env
  - [ ] Update .env.example with auth variables

---

### UI Improvements
- [ ] **Create loading states for auth**
  - [ ] Add skeleton loaders for login page
  - [ ] Add loading spinner during authentication
  - [ ] Add loading state for protected routes

- [ ] **Improve auth UX**
  - [ ] Show "Remember me" checkbox on login
  - [ ] Add "Forgot password" link
  - [ ] Add "Don't have an account? Sign up" link
  - [ ] Add password visibility toggle
  - [ ] Add form field focus states
  - [ ] Add keyboard shortcuts (Enter to submit)

---

## 📋 Phase 4: Documentation & Polish

### Documentation
- [ ] **Document auth setup**
  - [ ] Add auth setup to README.md
  - [ ] Document environment variables
  - [ ] Document how to create users with roles
  - [ ] Document session management
  - [ ] Document role-based access control

- [ ] **Document auth usage**
  - [ ] How to use useAuthSession composable
  - [ ] How to protect routes
  - [ ] How to get current user in API endpoints
  - [ ] How to implement role checks
  - [ ] Common auth patterns

---

### Testing & Bug Fixes
- [ ] **Fix known auth issues**
  - [ ] Fix userId/userRole extraction from session
  - [ ] Test session on different browsers
  - [ ] Test session on mobile devices
  - [ ] Fix any CORS issues
  - [ ] Test concurrent logins

- [ ] **Add auth tests**
  - [ ] Unit tests for useAuthSession composable
  - [ ] Integration tests for login flow
  - [ ] Integration tests for protected routes
  - [ ] Test role-based access control
  - [ ] Test API endpoint authentication

---

## 📊 Progress Tracking

### Phase 1: Critical Auth Tasks
- [ ] 0/8 Backend tasks completed
- [ ] 0/2 Composables tasks completed
- [ ] 0/1 Plugin tasks completed
- [ ] 0/2 Login page tasks completed
- [ ] 0/2 Middleware tasks completed
- [ ] 0/1 Logout tasks completed
- [ ] 0/1 Testing tasks completed
**Progress: 0% (0/17 tasks)**

### Phase 2: High Priority
**Progress: 0% (0/7 tasks)**

### Phase 3: Medium Priority
**Progress: 0% (0/8 tasks)**

### Phase 4: Documentation & Polish
**Progress: 0% (0/4 tasks)**

### Overall Progress
**Total: 0/36 tasks completed (0%)**

---

## 🎯 Success Criteria

Auth implementation is complete when:
- ✅ Users can sign up and create user_rma record
- ✅ Users can log in with username or email
- ✅ Session persists across page reloads
- ✅ Protected routes redirect to /login if not authenticated
- ✅ Users can only access routes based on their role
- ✅ API endpoints extract user context from session (not body)
- ✅ Users can log out and are redirected to /login
- ✅ Session expiry is handled gracefully
- ✅ All auth errors show user-friendly messages
- ✅ Complete auth flow is tested end-to-end

---

## 📝 Notes

- **Better Auth is already configured** - just need to integrate role into session
- **Auth tables exist** - user, session, account, verification tables are ready
- **user_rma table exists** - just need to link it to auth session
- **Auth client is configured** - [lib/auth-client.ts](lib/auth-client.ts) is ready
- **Focus is on frontend integration** - backend auth is 90% complete

**Next Step:** Start with Phase 1 - Task 1: Integrate user_rma.role into Better Auth session

---

**Generated:** 2026-01-13
**Project:** Sharp RMA System
**Repository:** /home/arsya/sharp/sharprma
