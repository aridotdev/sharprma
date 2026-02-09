# RMA CLAIM SYSTEM - FINAL SPECIFICATION DOCUMENT

> **Status**: FINALIZED & LOCKED ✅  
> **Last Update**: 2026-02-07  
> **Purpose**: Single source of truth untuk development

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Design](#database-design)
5. [Authentication & Authorization](#authentication--authorization)
6. [Business Logic & Flows](#business-logic--flows)
7. [API Endpoints Specification](#api-endpoints-specification)
8. [File Management](#file-management)
9. [Reports & Analytics](#reports--analytics)
10. [Development Guidelines](#development-guidelines)

---

## 1. PROJECT OVERVIEW

### 1.1 Tujuan Sistem

Membangun sistem internal RMA (Return Merchandise Authorization) Claim dengan:

- Alur CS → QRCC → Vendor
- Validasi foto & data berbasis vendor
- Audit trail lengkap
- Reporting & analytics

### 1.2 User Roles & Capabilities

| Role           | Capabilities    |
| -------------- | --------------- |
| **CS**         | Create & revisi claim, Upload foto, View status |
| **QRCC**       | Review & verify foto, Approve/reject claim, Generate vendor claim, Analytics & reports, CRUD master data |
| **MANAGEMENT** | View reports & analytics |
| **ADMIN**      | Full access + user management |

### 1.3 Target

- Internal company use
- Small user base (< 100 users)
- Ready for demo & production

---

## 2. TECH STACK | [Back to Top](#-table-of-contents)

### 2.1 Core Stack (WAJIB)

```
Frontend & Backend: Nuxt 4
UI Components: Nuxt UI
Icons: iconify-json/lucide
Database: SQLite
ORM: Drizzle ORM
Language: TypeScript
Auth: Better-Auth
Validation: Zod
```

### 2.2 Utilities

```
Date/Time: date-fns
Charts: unovis/vue
Excel: xlsx
Image Processing: sharp
Environment: dotenv
Styling: tailwindcss
Linting: eslint
```

### 2.3 Commands

```bash
npm run dev              # Development server
npm run build            # Production build
npm run preview          # nuxt preview
npm run postinstall      # nuxt prepare
npm run lint             # ESLint checking
npm run lint:fix         # ESLint Error Fixing
npm run typecheck        # TypeScript validation
npm run test             # Run all tests (Vitest)
npm run db:generate      # Generate migrations
npm run db:migrate       # Apply migrations
npm run db:studio        # Database studio
```

---

## 3. SYSTEM ARCHITECTURE

### 3.1 Folder Structure

```
project-root/
├── app
│   ├── assets/                 # main directory of the Nuxt application
│   ├── components/
│   ├── pages/
│   ├── composables/
│   ├── app.config.ts
│   └── app.vue
├── server/
│   ├── api/                    # API endpoints
│   │   ├── auth/               # Better-auth routes
│   │   ├── claims/             # Claim CRUD
│   │   ├── photos/             # Photo upload/review
│   │   ├── master/             # Master data endpoints
│   │   └── reports/            # Analytics & reports
│   ├── database/
│   │   ├── schema/             # Drizzle schemas
│   │   │   └── index.ts        # Export all
│   │   ├── migrations/         # Auto-generated
│   │   └── index.ts            # DB connection
│   ├── middleware/             # Auth, role checking
│   ├── repositories/           # DB operations
│   ├── services/               # Business logic
│   └── utils/                  # Helpers, validators
├── shared/                     # Shared between client & server
│   ├── types/                  # TypeScript types
│   ├── constants/              # Enums, configs
│   └── schemas/                # Zod schemas
├── public/
│   └── uploads/
│       └── claims/             # Photo storage
│           ├── *.jpg           # Original photos
│           └── thumbs/         # Thumbnails
└── .docs/                      # Project documentation
```

### 3.2 Code Style Guidelines

- **Formatting**: 2-space indentation, LF line endings
- **Vue Components**: `<script setup lang="ts">` with Composition API
- **Imports**: Relative imports only - Vue/Nuxt → third-party → local
- **Database**: Drizzle ORM with SQLite
- **Validation**: Zod schema validation untuk semua API routes
- **Error Handling**: `createError()` with proper status codes
- **File Naming**: PascalCase for components, camelCase for utils/composables
- **Testing**: Vitest with `.test.ts`, `.spec.ts` suffixes

### 3.3 Separation of Concerns

| Layer | Tanggung Jawab | Tidak Boleh | Folder |
| ----- | -------------- | ----------- | ------ |
| API Route  | HTTP, Auth, Validasi input dasar | Business logic, Query DB | server/api/\* |
| Service | Business logic, Koordinasi | Query DB langsung, HTTP stuff | server/services/\*.service.ts |
| Repository | CRUD database | Business logic, Auth | server/repositories/\*.repo.ts |

---


