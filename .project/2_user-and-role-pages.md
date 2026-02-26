# USER & ROLE, PAGES

> **Status**: FINALIZED & LOCKED ✅
> **Last Update**: 2026-02-21
> **Purpose**: Single source of truth untuk user, role, dan halaman aplikasi

------------------------------------------------------------------------

## 1. USER & ROLE

| Role           | Capabilities                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| **CS**         | Create & revisi claim, Upload foto, View status klaim sendiri                                            |
| **QRCC**       | Review & verify foto, Approve/reject claim, Generate vendor claim, Analytics & reports, CRUD master data |
| **MANAGEMENT** | View reports & analytics                                                                                 |
| **ADMIN**      | Full access + user management                                                                            |

**RINGKASAN AKSES MENU:**

| Menu                | CS  | QRCC | Management | Admin |
| ------------------- | --- | ---- | ---------- | ----- |
| Create/Revisi Claim | ✅   | ❌    | ❌          | ❌     |
| Review Claim        | ❌   | ✅    | ❌          | ✅     |
| Approve / Reject    | ❌   | ✅    | ❌          | ✅     |
| Reports             | ❌   | ✅    | ✅          | ✅     |
| Master Data         | ❌   | ✅    | ❌          | ✅     |
| User Management     | ❌   | ❌    | ❌          | ✅     |

------------------------------------------------------------------------

## 2. DAFTAR HALAMAN

### 🔐 Auth (Semua Role)

| URL      | Keterangan                 | Access |
| -------- | -------------------------- | ------ |
| `/login` | Halaman login (semua role) | Public |

------------------------------------------------------------------------

### 🧑 CS Area (`/cs`)

| URL                  | Keterangan                                                                                     | Access |
| -------------------- | ---------------------------------------------------------------------------------------------- | ------ |
| `/cs`                | Home CS: hero input Notification Code + daftar klaim milik CS (filter by status, tanggal, dll) | CS     |
| `/cs/claim/create`   | Multi-step form wizard buat claim baru (`?notification=<code>`)                                | CS     |
| `/cs/claim/:id`      | Detail klaim (read-only): info, foto, status, + tab **Claim History** (audit trail per klaim)  | CS     |
| `/cs/claim/:id/edit` | Edit klaim mode revisi (aktif saat status `NEED_REVISION`)                                     | CS     |

------------------------------------------------------------------------

### 📊 Dashboard Area (`/dashboard`)

> Diakses oleh QRCC, Management, Admin. Konten sidebar & widget berbeda per role.

#### Overview

| URL          | Keterangan                                               | Access                  |
| ------------ | -------------------------------------------------------- | ----------------------- |
| `/dashboard` | Home dashboard: statistik & widget ringkasan sesuai role | QRCC, Management, Admin |

#### Claims Management

| URL                     | Keterangan                                                                                      | Access      |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| `/dashboard/claims`     | Daftar klaim (filter by: status, vendor, tanggal)                                               | QRCC, Admin |
| `/dashboard/claims/:id` | Detail klaim lengkap + interface review foto, approve/reject, + tab **Claim History** per klaim | QRCC, Admin |

#### Audit Trail

| URL                      | Keterangan                                                                                     | Access      |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ----------- |
| `/dashboard/audit-trail` | Log semua ClaimHistory lintas klaim (filter by: klaim, user, action, tanggal); export ke Excel | QRCC, Admin |

#### Vendor Claims

| URL                               | Keterangan                                                                 | Access      |
| --------------------------------- | -------------------------------------------------------------------------- | ----------- |
| `/dashboard/vendor-claims`        | Daftar Vendor Claim (filter by: vendor, status)                            | QRCC, Admin |
| `/dashboard/vendor-claims/create` | Wizard: pilih klaim APPROVED yang belum diklaim → preview → generate batch | QRCC, Admin |
| `/dashboard/vendor-claims/:id`    | Detail Vendor Claim + input keputusan & kompensasi vendor per item         | QRCC, Admin |

#### Master Data

| URL                               | Keterangan                                               | Access      |
| --------------------------------- | -------------------------------------------------------- | ----------- |
| `/dashboard/master/vendor`        | CRUD Vendor (termasuk editor JSON requiredPhotos/Fields) | QRCC, Admin |
| `/dashboard/master/product-model` | CRUD Product Model                                       | QRCC, Admin |
| `/dashboard/master/notification`  | CRUD Notification Master                                 | QRCC, Admin |
| `/dashboard/master/defect`        | CRUD Defect Master                                       | QRCC, Admin |

#### Reports

| URL                  | Keterangan                                              | Access                  |
| -------------------- | ------------------------------------------------------- | ----------------------- |
| `/dashboard/reports` | Analytics & reports: klaim per periode, per vendor, dll | QRCC, Management, Admin |

#### User Management

| URL                | Keterangan                                             | Access |
| ------------------ | ------------------------------------------------------ | ------ |
| `/dashboard/users` | Daftar user: tambah, toggle active, ubah role & branch | Admin  |

------------------------------------------------------------------------

### 👤 Profile (Semua Role)

| URL        | Keterangan                       | Access    |
| ---------- | -------------------------------- | --------- |
| `/profile` | Lihat & edit nama, ubah password | All Roles |

------------------------------------------------------------------------

## 3. NAVIGASI SIDEBAR PER ROLE

### CS

```
🏠  Home              /cs
📋  My Claims         (section list di /cs)
👤  Profile           /profile
```

### QRCC

```
🏠  Dashboard         /dashboard
📋  Claims            /dashboard/claims
📦  Vendor Claims     /dashboard/vendor-claims
🗄️  Master Data       (collapsible group)
    ├── Vendor              /dashboard/master/vendor
    ├── Product Model       /dashboard/master/product-model
    ├── Notification        /dashboard/master/notification
    └── Defect Master       /dashboard/master/defect
📊  Reports           /dashboard/reports
🕵️  Audit Trail       /dashboard/audit-trail
👤  Profile           /profile
```

### Management

```
🏠  Dashboard         /dashboard
📊  Reports           /dashboard/reports
👤  Profile           /profile
```

### Admin

```
🏠  Dashboard         /dashboard
📋  Claims            /dashboard/claims
📦  Vendor Claims     /dashboard/vendor-claims
🗄️  Master Data       (collapsible group)
    ├── Vendor              /dashboard/master/vendor
    ├── Product Model       /dashboard/master/product-model
    ├── Notification        /dashboard/master/notification
    └── Defect Master       /dashboard/master/defect
📊  Reports           /dashboard/reports
🕵️  Audit Trail       /dashboard/audit-trail
👥  Users             /dashboard/users
👤  Profile           /profile
```

------------------------------------------------------------------------

## 4. CATATAN PENTING

- **Post-login redirect:** setelah login, sistem redirect otomatis sesuai role:
  - CS → `/cs`
  - QRCC / Management / Admin → `/dashboard`
- **Route protection (middleware):**
  - `/cs/*` → hanya CS
  - `/dashboard/*` → hanya QRCC, Management, Admin
  - `/dashboard/claims/*` → hanya QRCC, Admin
  - `/dashboard/vendor-claims/*` → hanya QRCC, Admin
  - `/dashboard/master/*` → hanya QRCC, Admin
  - `/dashboard/users` → hanya Admin
- **Unauthorized redirect:** akses ke URL yang tidak sesuai role → redirect ke halaman home masing-masing
- **Profile `/profile`:** semua role bisa akses, hanya bisa edit nama & ubah password (bukan role/branch — itu hanya bisa diubah Admin)
