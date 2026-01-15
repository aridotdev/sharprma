/**
 * Role-based access control (RBAC) middleware
 * ------------------------------------------------
 * Tugas:
 * - Memastikan user sudah login
 * - Memastikan user punya role yang diizinkan
 *
 * Middleware ini TIDAK:
 * - Query database langsung
 * - Tahu detail HTTP response
 */

import { createError, defineEventHandler } from "h3";
import type { UserRMA, UserRole } from "~/server/types/user-rma";

/**
 * Factory function
 * ----------------
 * Kita buat middleware sebagai function
 * supaya bisa kirim parameter role yang diizinkan
 *
 * Contoh:
 *   requireRole(["ADMIN"])
 *   requireRole(["ADMIN", "CS"])
 */
export function requireRole(allowedRoles: UserRole[]) {
  return defineEventHandler(async (event) => {
    /**
     * 1️⃣ Ambil user RMA dari context
     *
     * Context ini diasumsikan SUDAH di-set
     * oleh auth middleware (auth.ts)
     *
     * auth.ts biasanya mengisi:
     *   event.context.user
     */
    const user = event.context.user as UserRMA | undefined;

    /**
     * 2️⃣ Jika user belum login / context belum ada
     */
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    /**
     * 3️⃣ Jika user non-aktif
     * - Walaupun role benar, user disabled tetap ditolak
     */
    if (!user.isActive) {
      throw createError({
        statusCode: 403,
        statusMessage: "User is inactive",
      });
    }

    /**
     * 4️⃣ Cek apakah role user diizinkan
     */
    if (!allowedRoles.includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: insufficient role",
      });
    }

    /**
     * 5️⃣ Jika lolos semua check
     * - Request boleh lanjut ke handler API
     */
  });
}
