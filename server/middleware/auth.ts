/**
 * AUTH MIDDLEWARE
 * ------------------------------------------------
 * Tugas utama:
 * 1. Memastikan request SUDAH login (via better-auth)
 * 2. Mengambil authUserId dari session
 * 3. Mengambil user-RMA dari database (Drizzle + SQLite)
 * 4. Inject user ke event.context agar bisa dipakai middleware & API lain
 *
 * Middleware ini adalah "jembatan" antara:
 * - better-auth (auth)
 * - user-rma (business user)
 */

import { defineEventHandler, createError } from "h3";
import { getAuthUserId } from "~/server/utils/auth-context";
import { getUserByAuthUserId } from "~/server/services/user-rma.service";

export default defineEventHandler(async (event) => {
  /**
   * 1️⃣ Ambil authUserId dari session
   * ------------------------------------------------
   * Data ini berasal dari better-auth
   * Biasanya diambil dari cookie / header
   */
  const authUserId = getAuthUserId(event);

  /**
   * 2️⃣ Jika tidak ada authUserId
   * ------------------------------------------------
   * Artinya:
   * - User belum login
   * - Session expired
   */
  if (!authUserId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  /**
   * 3️⃣ Ambil user RMA (business user)
   * ------------------------------------------------
   * Kita TIDAK pakai data user dari better-auth
   * Karena role, branch, vendor ada di user-RMA
   */
  const user = await getUserByAuthUserId(authUserId);

  /**
   * 4️⃣ Jika user RMA belum ada
   * ------------------------------------------------
   * Biasanya:
   * - Auth user sudah dibuat
   * - Tapi admin belum buat user bisnisnya
   */
  if (!user) {
    throw createError({
      statusCode: 403,
      statusMessage: "User RMA not registered",
    });
  }

  /**
   * 5️⃣ Jika user RMA tidak aktif
   * ------------------------------------------------
   * User masih login, tapi sudah di-disable admin
   */
  if (!user.isActive) {
    throw createError({
      statusCode: 403,
      statusMessage: "User is inactive",
    });
  }

  /**
   * 6️⃣ Inject user ke context
   * ------------------------------------------------
   * Setelah ini:
   * - role middleware bisa pakai
   * - API handler bisa pakai
   *
   * event.context.user = UserRMA
   */
  event.context.user = user;
});
