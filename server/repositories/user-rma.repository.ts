/**
 * Repository layer
 * - HANYA urus database
 * - Tidak tahu auth, role, HTTP, dll
 */

import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema/users";
import type { UserRMA } from "~/server/types/user-rma";

/**
 * ===============================
 * FIND BY AUTH USER ID
 * ===============================
 * Dipakai untuk /users/me
 */
export async function findUserByAuthUserId(
  authUserId: string
): Promise<UserRMA | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUserId))
    .limit(1);

  /**
   * SQLite return array
   * Jika kosong → null
   */
  return result[0] ?? null;
}

/**
 * ===============================
 * FIND BY USER ID (PK)
 * ===============================
 */
export async function findUserById(userId: string): Promise<UserRMA | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * ===============================
 * CREATE USER RMA
 * ===============================
 */
export async function createUser(data: {
  authUserId: string;
  name: string;
  role: UserRMA["role"];
  branch: string;
  vendorId?: string | null;
  isActive: boolean;
}): Promise<UserRMA> {
  /**
   * SQLite tidak support returning secara native
   * Jadi kita insert lalu query ulang
   */
  await db.insert(users).values({
    authUserId: data.authUserId,
    name: data.name,
    role: data.role,
    branch: data.branch,
    vendorId: data.vendorId ?? null,
    isActive: data.isActive,
  });

  /**
   * Ambil ulang data yang baru dibuat
   */
  const created = await findUserByAuthUserId(data.authUserId);

  if (!created) {
    throw new Error("Failed to create user RMA");
  }

  return created;
}

/**
 * ===============================
 * UPDATE USER RMA
 * ===============================
 */
export async function updateUser(
  userId: string,
  data: Partial<
    Pick<UserRMA, "name" | "role" | "branch" | "vendorId" | "isActive">
  >
): Promise<UserRMA> {
  await db.update(users).set(data).where(eq(users.id, userId));

  const updated = await findUserById(userId);

  if (!updated) {
    throw new Error("Failed to update user RMA");
  }

  return updated;
}

export async function listUsersRepo(filters: {
  role?: UserRMA["role"];
  branch?: string;
  isActive?: boolean;
  page: number;
  limit: number;
}) {
  const conditions = [];

  if (filters.role) conditions.push(eq(users.role, filters.role));
  if (filters.branch) conditions.push(eq(users.branch, filters.branch));
  if (filters.isActive !== undefined)
    conditions.push(eq(users.isActive, filters.isActive));

  const offset = (filters.page - 1) * filters.limit;

  const data = await db
    .select()
    .from(users)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(filters.limit)
    .offset(offset);

  return {
    data,
    page: filters.page,
    limit: filters.limit,
  };
}
