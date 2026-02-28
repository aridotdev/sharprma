---
trigger: always_on
---

# Frontend Rules

Rules and guidelines for frontend development in the RMA Claim System.

## 1. Authentication & Role-Based Access Control (RBAC)

### Access Matrix
| Menu                |  CS   | QRCC  | Management | Admin |
| :------------------ | :---: | :---: | :--------: | :---: |
| Create/Revisi Claim |   ✅   |   ❌   |     ❌      |   ❌   |
| Review Claim        |   ❌   |   ✅   |     ❌      |   ✅   |
| Approve / Reject    |   ❌   |   ✅   |     ❌      |   ✅   |
| Reports             |   ❌   |   ✅   |     ✅      |   ✅   |
| Master Data         |   ❌   |   ✅   |     ❌      |   ✅   |
| User Management     |   ❌   |   ❌   |     ❌      |   ✅   |

### Route Protection (Middleware)
- `/cs/*` -> Restricted to **CS** role only.
- `/dashboard/*` -> Restricted to **QRCC**, **Management**, and **Admin**.
- `/dashboard/claims/*` -> Restricted to **QRCC** and **Admin**.
- `/dashboard/vendor-claims/*` -> Restricted to **QRCC** and **Admin**.
- `/dashboard/master/*` -> Restricted to **QRCC** and **Admin**.
- `/dashboard/users` -> Restricted to **Admin** only.

### Post-Login Redirect
- **CS** -> Redirect to `/cs`
- **QRCC**, **Management**, **Admin** -> Redirect to `/dashboard`

## 2. UI/UX Patterns

### Navigation Structure (Sidebar)
- **CS**: Home (`/cs`), My Claims (list at `/cs`), Profile (`/profile`).
- **QRCC**: Dashboard, Claims, Vendor Claims, Master Data (Vendor, Product Model, Notification, Defect), Reports, Audit Trail, Profile.
- **Management**: Dashboard, Reports, Profile.
- **Admin**: Dashboard, Claims, Vendor Claims, Master Data, Reports, Audit Trail, Users, Profile.

### Claim Submission (CS)
- Use a **multi-step form wizard** for creating new claims.
- Notification Code input is the entry point for new claims.

## 3. Client-Side Validation

### File Uploads (Claims)
- **Allowed Types**: `image/jpeg`, `image/png`.
- **Max File Size**: 5MB per photo.
- **Required Photos**: Based on Vendor configuration (`requiredPhotos`).
- **Required Fields**: Based on Vendor configuration (`requiredFields`).

## 4. Documentation & Constants

- Refer to the constants defined in `shared/constants/` (Sync with `.project/6_constants.md`).
- Use `as const` pattern for all enums.

## 5. Other

- Harus gunakan context7
- Utamakan menggunakan component NUXTUI
 