/**
 * Service layer = tempat business logic
 * - API tidak boleh query DB langsung
 * - Repository tidak boleh tahu soal auth / HTTP
 */

import { createError } from "h3";
import {
  findUserByAuthUserId,
  findUserById,
  createUser,
  updateUser,
} from "~/server/repositories/user-rma.repository";
import type { UserRMA } from "~/server/types/user-rma";

/**
 * ===============================
 * GET CURRENT USER (ME)
 * ===============================
 */

/**
 * Ambil user RMA berdasarkan authUserId (better-auth)
 * Dipakai oleh endpoint: GET /api/users/me
 */
export async function getUserByAuthUserId(
  authUserId: string
): Promise<UserRMA | null> {
  /**
   * Validasi input (defensive programming)
   */
  if (!authUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Auth user id is required",
    });
  }

  /**
   * Query ke database via repository
   */
  const user = await findUserByAuthUserId(authUserId);

  /**
   * Bisa null → ditangani di API layer
   */
  return user;
}

/**
 * ===============================
 * GET USER BY ID (ADMIN)
 * ===============================
 */
export async function getUserById(userId: string): Promise<UserRMA | null> {
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User id is required",
    });
  }

  return await findUserById(userId);
}

/**
 * ===============================
 * CREATE USER RMA
 * ===============================
 * Catatan penting:
 * - Auth user (better-auth) DIANGGAP SUDAH ADA
 * - Service ini hanya buat business user
 */
export async function createUserRMA(data: {
  authUserId: string;
  name: string;
  role: UserRMA["role"];
  branch: string;
  vendorId?: string | null;
}): Promise<UserRMA> {
  /**
   * Validasi field wajib
   */
  if (!data.authUserId || !data.name || !data.role || !data.branch) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required user data",
    });
  }

  /**
   * Cegah duplicate business user
   * 1 auth user = 1 RMA user
   */
  const existing = await findUserByAuthUserId(data.authUserId);
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: "User RMA already exists",
    });
  }

  /**
   * Create user business
   */
  return await createUser({
    authUserId: data.authUserId,
    name: data.name,
    role: data.role,
    branch: data.branch,
    vendorId: data.vendorId ?? null,
    isActive: true,
  });
}

/**
 * ===============================
 * UPDATE USER RMA
 * ===============================
 * Hanya update data bisnis (BUKAN auth)
 */
export async function updateUserRMA(
  userId: string,
  data: Partial<Pick<UserRMA, "name" | "role" | "branch" | "vendorId">>
): Promise<UserRMA> {
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User id is required",
    });
  }

  /**
   * Pastikan user ada
   */
  const user = await findUserById(userId);
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  /**
   * Update hanya field yang diizinkan
   */
  return await updateUser(userId, {
    name: data.name ?? user.name,
    role: data.role ?? user.role,
    branch: data.branch ?? user.branch,
    vendorId: data.vendorId !== undefined ? data.vendorId : user.vendorId,
  });
}

/**
 * ===============================
 * ACTIVATE / DEACTIVATE USER
 * ===============================
 */
export async function setUserActiveStatus(
  userId: string,
  isActive: boolean
): Promise<UserRMA> {
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User id is required",
    });
  }

  const user = await findUserById(userId);
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  /**
   * Soft delete / restore
   */
  return await updateUser(userId, {
    isActive,
  });
}

/*
 * ===============================
 * LIST USERS WITH FILTERS
 * =============================
 */

export async function listUsers(filters: {
  role?: UserRMA["role"];
  branch?: string;
  isActive?: boolean;
  page: number;
  limit: number;
}) {
  return await listUsersRepo(filters);
}
