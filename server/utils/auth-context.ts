import { defineEventHandler, createError, H3Event } from "h3";
import { getAuthUserId } from "~/server/utils/auth-context";
import { getUserByAuthUserId } from "~/server/services/user-rma.service";

export function getAuthUserId(event: H3Event): string | null {
  return event.context.auth?.user?.id ?? null;
}

export default defineEventHandler(async (event) => {
  /**
   * 1️⃣ Ambil authUserId dari session
   * - Data ini berasal dari better-auth
   * - Sudah diproses di middleware auth.ts
   */
  const authUserId = getAuthUserId(event);

  /**
   * 2️⃣ Jika tidak ada authUserId
   * - Artinya user belum login
   */
  if (!authUserId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  /**
   * 3️⃣ Ambil user RMA (business user)
   * - Cari berdasarkan authUserId
   * - Auth user ≠ Business user
   */
  const user = await getUserByAuthUserId(authUserId);

  /**
   * 4️⃣ Jika user tidak ditemukan
   * - Biasanya auth ada tapi business user belum dibuat
   */
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User RMA not found",
    });
  }

  /**
   * 5️⃣ Jika user non-aktif
   * - User masih ada tapi sudah di-disable admin
   */
  if (!user.isActive) {
    throw createError({
      statusCode: 403,
      statusMessage: "User is inactive",
    });
  }

  /**
   * 6️⃣ Return data user
   * - Jangan return data sensitif
   * - Ini akan dipakai frontend sebagai source of truth
   */
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    branch: user.branch,
    vendorId: user.vendorId,
    authUserId: user.authUserId,
  };
});
