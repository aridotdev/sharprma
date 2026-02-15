# RMA Claim System

> **Status**: FINALIZED & LOCKED ✅  
> **Last Update**: 2026-02-07  
> **Purpose**: Single source of truth untuk development

------------------------------------------------------------------------

## A. TUJUAN SISTEM

  Membangun sistem internal RMA (Return Merchandise Authorization) Claim dengan:

- Alur CS → QRCC → Vendor
- Validasi foto & data berbasis vendor
- Audit trail lengkap
- Reporting & analytics

------------------------------------------------------------------------

## B. Tech Stack (WAJIB digunakan)

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

------------------------------------------------------------------------

## C. Commands & Development Workflow

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

------------------------------------------------------------------------

## D. Code Style Guidelines
- **Formatting**: 2-space indentation, LF line endings, no trailing whitespace
- **Vue Components**: Use `<script setup lang="ts">` with Composition API
- **Imports**: Relative imports only - Vue/Nuxt → third-party → local
- **Database**: Drizzle ORM with SQLite, schemas in `/server/database/schema/`
- **Validation**: Gunakan Zod schema validation yang tepat untuk setiap tipe API route http request (Runtime + Type-Safe Request Utils)
- **Error Handling**: `createError()` with proper status codes in try/catch blocks
- **File Naming**: PascalCase for components, camelCase for utils/composables
- **Testing**: Vitest with `.test.ts` or `.spec.ts` suffixes in test files

------------------------------------------------------------------------

## E. Separation of Concerns

| Layer      | Tanggung Jawab                   | Tidak Boleh                   | Folder                         |
| ---------- | -------------------------------- | ----------------------------- | ------------------------------ |
| API Route  | HTTP, Auth, Validasi input dasar | Business logic, Query DB      | server/api/\*                  |
| Service    | Business logic, Koordinasi       | Query DB langsung, HTTP stuff | server/services/\*.service.ts  |
| Repository | CRUD database                    | Business logic, Auth          | server/repositories/\*.repo.ts |

------------------------------------------------------------------------

## F. Tujuan Akhir
  1. menjadi aplikasi yang siap untuk di demokan.
  2. sudah lolos testing dan audit.
  3. aplikasi yang siap digunakan oleh tim dan user.

------------------------------------------------------------------------