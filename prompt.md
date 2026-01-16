Baik! Saya buatkan **template prompt untuk AI coding** yang siap pakai dan sudah best practice. Template ini bisa Anda simpan dan pakai ulang.

---

# 📋 Template Prompt AI untuk Koding

## **1. Template: Buat Fitur Baru**

```markdown
## Context
Project: [nama project]
Tech stack: [Nuxt 4, TypeScript, Drizzle ORM, dll]
Current structure: [jelaskan struktur folder]

## Goal
Saya ingin membuat fitur [nama fitur].

## Requirements
1. [requirement 1]
2. [requirement 2]
3. [requirement 3]

## Specific Details
- User yang bisa akses: [role yang boleh]
- Data yang perlu disimpan: [field-field apa saja]
- Validasi: [aturan validasi]
- Flow: [jelaskan alur kerja fitur]

## Technical Constraints
- Gunakan service & repository pattern
- Follow TypeScript strict mode
- Gunakan Nuxt UI components kalau tersedia
- Error handling yang proper

## Expected Output
1. Database schema (Drizzle)
2. Types definition
3. Repository layer
4. Service layer
5. API routes
6. Frontend component (kalau perlu)

## Notes
[catatan tambahan atau pertimbangan khusus]
```

**Contoh Penggunaan:**

```markdown
## Context
Project: Sistem Absensi Guru SLB Negeri 2 Padang
Tech stack: Nuxt 4, TypeScript, Drizzle ORM, Better Auth, Nuxt UI
Current structure: Sudah ada user management dengan role ADMIN dan GURU

## Goal
Saya ingin membuat fitur jurnal pembelajaran harian untuk guru.

## Requirements
1. Guru bisa input jurnal pembelajaran setiap hari
2. Admin bisa lihat semua jurnal
3. Guru hanya lihat jurnal mereka sendiri
4. Jurnal punya field: tanggal, kelas, mata pelajaran, materi, metode, evaluasi
5. Bisa export ke PDF

## Specific Details
- User yang bisa akses: ADMIN (read all), GURU (read own, create, update own)
- Data yang perlu disimpan: tanggal, guruId, kelas, mapel, materi, metode, evaluasi, createdAt, updatedAt
- Validasi: 
  - Tanggal tidak boleh masa depan
  - Satu guru tidak boleh input jurnal duplikat untuk tanggal & kelas yang sama
  - Semua field wajib diisi
- Flow:
  1. Guru login
  2. Buka halaman jurnal
  3. Klik "Tambah Jurnal"
  4. Isi form
  5. Submit
  6. Lihat daftar jurnal yang sudah dibuat

## Technical Constraints
- Gunakan service & repository pattern
- Follow TypeScript strict mode
- Gunakan Nuxt UI untuk form & table
- Error handling yang proper
- Permission check di service layer

## Expected Output
1. Database schema (Drizzle) untuk table journals
2. Types definition (JournalStatus, Journal interface, dll)
3. JournalRepository dengan CRUD methods
4. JournalService dengan business logic & validation
5. API routes (/api/journals)
6. Frontend page (/pages/journals/index.vue)
7. Form component (JournalForm.vue)

## Notes
- Nanti akan ditambah fitur approval dari admin
- Simpan data dengan timezone Asia/Jakarta
```

---

## **2. Template: Debug Error**

```markdown
## Error Context
Saya mendapat error berikut:

```
[paste error message lengkap dengan stack trace]
```

## Code yang Bermasalah
```typescript
[paste kode yang error]
```

## What I've Tried
1. [apa yang sudah dicoba]
2. [hasil dari percobaan tersebut]

## Expected Behavior
[apa yang seharusnya terjadi]

## Actual Behavior
[apa yang terjadi sekarang]

## Environment
- Nuxt version: [versi]
- Node version: [versi]
- Browser: [kalau frontend error]

## Additional Context
[informasi lain yang relevan]
```

**Contoh Penggunaan:**

```markdown
## Error Context
Saya mendapat error berikut saat mencoba create claim:

```
Error: Cannot read property 'id' of undefined
at ClaimService.createClaim (claim.service.ts:45)
```

## Code yang Bermasalah
```typescript
async createClaim(input: ClaimCreateInput) {
  const user = await this.userRepo.findById(input.userId)
  
  if (user.status !== 'ACTIVE') {  // ← error di sini
    throw new Error('User tidak aktif')
  }
  
  return await this.claimRepo.create(input)
}
```

## What I've Tried
1. Console.log input.userId → hasilnya ada (string UUID)
2. Console.log user → hasilnya undefined
3. Cek database manual → user dengan ID tersebut ada

## Expected Behavior
Seharusnya user ditemukan dan bisa lanjut create claim

## Actual Behavior
user undefined, padahal ID ada di database

## Environment
- Nuxt version: 4.0.0
- Node version: 20.10.0
- Database: PostgreSQL 15

## Additional Context
UserRepository.findById menggunakan Drizzle ORM
```

---

## **3. Template: Code Review**

```markdown
## Context
Tolong review kode berikut dan berikan feedback.

## Code
```typescript
[paste kode yang mau direview]
```

## Specific Concerns
Saya khawatir tentang:
1. [concern 1]
2. [concern 2]

## Review Checklist
Tolong cek:
- [ ] Type safety
- [ ] Error handling
- [ ] Performance
- [ ] Security
- [ ] Best practices
- [ ] Code organization

## Additional Questions
[pertanyaan spesifik tentang kode]
```

---

## **4. Template: Refactor Code**

```markdown
## Current Code
```typescript
[paste kode yang mau direfactor]
```

## Problems with Current Code
1. [masalah 1]
2. [masalah 2]

## Goals for Refactoring
- [ ] Improve readability
- [ ] Better type safety
- [ ] Follow [pattern tertentu]
- [ ] Reduce duplication
- [ ] Better error handling

## Constraints
- Harus backward compatible dengan [...]
- Tidak boleh mengubah [...]
- Harus tetap support [...]

## Expected Improvements
[jelaskan hasil yang diharapkan]
```

---

## **5. Template: Explain Code/Concept**

```markdown
## Code/Concept to Explain
```typescript
[paste kode yang ingin dipahami]
```

## What I Know
Saya sudah paham tentang:
- [konsep A]
- [konsep B]

## What I Don't Understand
Saya bingung tentang:
1. [pertanyaan spesifik 1]
2. [pertanyaan spesifik 2]

## How to Explain
- Gunakan analogi sederhana
- Berikan contoh praktis
- Jelaskan "kenapa" bukan hanya "cara"
- Bahasa Indonesia yang mudah dipahami
```

**Contoh:**

```markdown
## Code/Concept to Explain
```typescript
export const USER_ROLES = ['ADMIN', 'GURU'] as const
export type UserRole = typeof USER_ROLES[number]
```

## What I Know
Saya sudah paham tentang:
- const untuk constant
- type untuk type definition

## What I Don't Understand
Saya bingung tentang:
1. Apa fungsi "as const" di sini?
2. Kenapa pakai "typeof USER_ROLES[number]"?
3. Apa bedanya dengan cara biasa: type UserRole = 'ADMIN' | 'GURU'?

## How to Explain
- Gunakan analogi sederhana
- Jelaskan keuntungan cara ini vs cara lain
- Berikan contoh penggunaan praktis
```

---

## **6. Template: Optimize Performance**

```markdown
## Current Implementation
```typescript
[paste kode yang perlu dioptimasi]
```

## Performance Issue
- [ ] Slow query
- [ ] Memory leak
- [ ] Too many re-renders
- [ ] Large bundle size
- [ ] Other: [jelaskan]

## Metrics
- Current performance: [angka/benchmark]
- Target performance: [target]
- Constraints: [batasan]

## What I've Profiled
[hasil dari profiling/measurement]

## Optimization Goals
Prioritas:
1. [goal 1]
2. [goal 2]
```

---

## **7. Template: Architecture Decision**

```markdown
## Problem
[jelaskan masalah atau decision yang perlu dibuat]

## Options
### Option 1: [nama option]
**Pros:**
- [pro 1]
- [pro 2]

**Cons:**
- [con 1]
- [con 2]

### Option 2: [nama option]
**Pros:**
- [pro 1]

**Cons:**
- [con 1]

## Context & Constraints
- Team size: [jumlah]
- Timeline: [waktu]
- Budget: [budget]
- Technical constraints: [constraint]

## Questions
1. Which option is better for [situation]?
2. Are there other options I'm missing?
3. What are the long-term implications?
```

---

## **8. Template: Test Writing**

```markdown
## Code to Test
```typescript
[paste kode yang mau dibuat test-nya]
```

## Test Requirements
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

## Scenarios to Cover
1. Happy path: [scenario]
2. Edge cases:
   - [edge case 1]
   - [edge case 2]
3. Error cases:
   - [error case 1]
   - [error case 2]

## Testing Framework
- Framework: [Vitest, Jest, dll]
- Mocking: [apa yang perlu di-mock]

## Expected Coverage
Target coverage: [80%, 90%, dll]
```

---

## **9. Template: API Design**

```markdown
## Feature
[nama fitur yang butuh API]

## Endpoints Needed
1. [endpoint 1] - [purpose]
2. [endpoint 2] - [purpose]

## Data Flow
[jelaskan alur data dari request sampai response]

## Authentication
- [ ] Public
- [ ] Requires auth
- [ ] Role-based: [roles]

## Request/Response Examples

### Endpoint: POST /api/claims
**Request:**
```json
{
  "title": "...",
  "amount": 100000
}
```

**Response (Success):**
```json
{
  "id": "...",
  "status": "DRAFT"
}
```

**Response (Error):**
```json
{
  "error": "...",
  "statusCode": 400
}
```

## Validation Rules
1. [rule 1]
2. [rule 2]

## Questions
- Apakah struktur ini sudah RESTful?
- Apakah perlu pagination?
- Bagaimana handle error yang baik?
```

---

## **10. Template: Migration/Update Existing Code**

```markdown
## Current State
```typescript
[kode yang sekarang]
```

## Desired State
Saya ingin mengubahnya menjadi:
[jelaskan hasil yang diinginkan]

## Migration Path
Tolong bantu:
1. Step-by-step migration plan
2. Handle backward compatibility
3. Data migration (if needed)
4. Testing strategy

## Risks
Perhatikan:
- [risk 1]
- [risk 2]

## Rollback Plan
Kalau gagal, bagaimana rollback?
```

---

## **💡 Tips Menggunakan Template**

### **1. Selalu Berikan Konteks**
❌ "Buatkan CRUD user"  
✅ "Saya punya project Nuxt 4 dengan Better Auth. Butuh CRUD user untuk admin dashboard dengan role-based access."

### **2. Spesifik dan Detail**
❌ "Ada error di code"  
✅ "Error 'Cannot read property X' di baris Y saat melakukan Z. Sudah coba A tapi hasilnya B."

### **3. Jelaskan "Kenapa"**
❌ "Pakai service pattern"  
✅ "Pakai service pattern karena butuh reuse logic di API dan cron job"

### **4. Include Constraints**
Selalu sebutkan batasan:
- Tech stack yang dipakai
- Tidak boleh mengubah X
- Harus support Y
- Budget/timeline

### **5. Show What You've Tried**
Biar AI tidak suggest hal yang sudah Anda coba:
- "Sudah coba X tapi hasilnya Y"
- "Sudah baca dokumentasi Z tapi masih bingung tentang..."

---

## **📁 Cara Menyimpan Template**

### **Option 1: File Markdown**
```
/your-project
  ├── .ai-templates/
  │   ├── new-feature.md
  │   ├── debug-error.md
  │   ├── code-review.md
  │   └── refactor.md
```

### **Option 2: Snippet di IDE**
Buat snippet di VS Code untuk template yang sering dipakai.

### **Option 3: Di agent.md**
```markdown
# agent.md

## Prompt Templates

Ketika saya minta bantuan, gunakan format berikut:

### For New Feature
- Context: [tech stack & current state]
- Goal: [what to build]
- Requirements: [list]
...
```

---

## **🎯 Template Khusus untuk Pemula**

```markdown
## Saya Pemula, Tolong Jelaskan

Saya baru belajar coding dan sedang kerja di:
[jelaskan project]

Saya mau [jelaskan goal], tapi saya belum tahu:
1. [konsep yang belum paham]
2. [hal yang membingungkan]

Tolong jelaskan:
- Dengan bahasa sederhana (seperti ke pemula)
- Pakai analogi kalau bisa
- Step-by-step
- Kode yang simple dulu, tidak perlu yang kompleks
- Jelaskan "kenapa" untuk setiap keputusan

Saya sudah paham:
- [list hal yang sudah dipahami]

Saya belum paham:
- [list hal yang belum dipahami]
```

---

## **✅ Checklist Prompt yang Baik**

Sebelum send prompt, cek:
- [ ] Ada konteks yang cukup?
- [ ] Goal-nya jelas?
- [ ] Sudah spesifik atau masih terlalu umum?
- [ ] Sudah sebutkan constraints?
- [ ] Sudah include code/error yang relevan?
- [ ] Sudah jelaskan apa yang sudah dicoba?
- [ ] Expected output sudah clear?

---

## **Kesimpulan**

Template ini akan membantu Anda:
✅ Mendapat jawaban yang lebih akurat  
✅ Menghemat waktu bolak-balik clarification  
✅ Belajar struktur prompt yang baik  
✅ Konsisten dalam berkomunikasi dengan AI  

**Simpan template ini dan customize sesuai kebutuhan Anda!** 

Mau saya buatkan template khusus untuk case tertentu? Atau ada format prompt lain yang Anda butuhkan? 🚀