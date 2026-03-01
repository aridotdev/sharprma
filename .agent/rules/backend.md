---
trigger: always_on
---

# Backend Rules

Rules and guidelines for backend development in the RMA Claim System.

## 1. Database Design Principles

### Data Types & Formatting
- **Timestamps**: Use `integer` for Unix milliseconds. Implementation with Drizzle: `mode: 'timestamp_ms'`.
- **Booleans**: Use `integer` (0 for false, 1 for true). Implementation with Drizzle: `mode: 'boolean'`.
- **Enums**: Store as `text` in the database. Perform validation using **Zod** in the application layer. No native DB enums.
- **Foreign Keys**: Always use `integer` types for IDs.

### Timestamp Standard
```typescript
createdAt: integer({ mode: 'timestamp_ms' })
  .notNull()
  .default(sql`(unixepoch() * 1000)`),
updatedAt: integer({ mode: 'timestamp_ms' })
  .notNull()
  .default(sql`(unixepoch() * 1000)`)
  .$onUpdateFn(() => new Date())
```

## 2. Soft Delete & Audit Trail

### Soft Delete Strategy
- **Vendors/Users**: Use an `isActive: integer` flag. Never delete records from these tables.
- **Claims**: Use `claimStatus = 'ARCHIVED'` to hide claims from active lists.
- **Historical Data**: Ensure all historical data remains intact for audit purposes.

### Audit Trail (ClaimHistory)
- Every status change or significant action on a claim MUST be logged in the `ClaimHistory` table.
- Log action, previous status, new status, user ID, user role, and optional notes.

## 3. File Management & Security

### Storage Configuration
- **Directory**: `./public/uploads/claims/`.
- **Naming Convention**: `{claimId}_{photoType}_{timestamp}.jpg`.
- **Thumbnail Generation**: Generate 300x300px thumbnails using the `sharp` library.

### Security Measures
- **Path Sanitization**: Never trust user input for file paths.
- **Traversal Prevention**: Validate that the resolved file path starts with the designated `UPLOAD_DIR`.
- **Server-side Validation**: Re-validate file types and sizes (Max 5MB) on the server.

## 4. Authentication Integration (Better-Auth)

### Profile Linking
- **userAuthId**: Use `TEXT` (UUID) to link the `Profile` table to the Better-Auth `User` table.
- **Relation Naming**: Use `auth` for the relation to the auth user and `profile` for the inverse relation.
- **Deletion Policy**: Use `onDelete: 'restrict'` for the profile record when an auth user is deleted to preserve business data.

## 5. Naming Conventions

- **Tables**: Singular PascalCase in Drizzle schema files.
- **Relations**: Descriptive names (e.g., `submittedBy`, `updatedBy`).
- **Files**: kebab-case for filenames.

## 6. Other

- **Schema Drizzle** : 1 table/schema untuk 1 file