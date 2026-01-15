/**
 * GET /api/users
 * ------------------------------------------------
 * Tujuan:
 * - List user RMA
 * - Support filter & pagination
 * - ADMIN only
 */

import { defineEventHandler, getQuery } from "h3";
import { z } from "zod";
import { requireRole } from "~/server/middleware/role";
import { listUsers } from "~/server/services/user-rma.service";

/**
 * Query validation schema
 */
const querySchema = z.object({
  role: z.enum(["ADMIN", "CS", "QRCC", "MANAGEMENT"]).optional(),
  branch: z.string().optional(),
  isActive: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
});

export default defineEventHandler({
  /**
   * Middleware:
   * - auth.ts (global / server middleware)
   * - role.ts (ADMIN only)
   */
  onRequest: [requireRole(["ADMIN"])],

  async handler(event) {
    /**
     * 1️⃣ Ambil & validasi query params
     */
    const query = querySchema.parse(getQuery(event));

    /**
     * 2️⃣ Ambil data via service
     */
    const result = await listUsers({
      role: query.role,
      branch: query.branch,
      isActive: query.isActive,
      page: query.page,
      limit: query.limit,
    });

    /**
     * 3️⃣ Return response
     */
    return result;
  },
});
