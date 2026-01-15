/**
 * POST /api/users
 * ------------------------------------------------
 * Tujuan:
 * - Create business user (user-RMA)
 * - Link ke authUserId (better-auth)
 * - ADMIN only
 */

import { defineEventHandler, readBody } from "h3";
import { z } from "zod";
import { requireRole } from "~/server/middleware/role";
import { createUserRMA } from "~/server/services/user-rma.service";

/**
 * Body validation schema
 */
const bodySchema = z.object({
  authUserId: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "CS", "QRCC", "MANAGEMENT"]),
  branch: z.string().min(1),
  vendorId: z.string().nullable().optional(),
});

export default defineEventHandler({
  /**
   * Middleware:
   * - auth.ts
   * - role.ts (ADMIN only)
   */
  onRequest: [requireRole(["ADMIN"])],

  async handler(event) {
    /**
     * 1️⃣ Baca & validasi body
     */
    const body = bodySchema.parse(await readBody(event));

    /**
     * 2️⃣ Create user RMA via service
     */
    const user = await createUserRMA({
      authUserId: body.authUserId,
      name: body.name,
      role: body.role,
      branch: body.branch,
      vendorId: body.vendorId ?? null,
    });

    /**
     * 3️⃣ Return data user (tanpa data sensitif)
     */
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      branch: user.branch,
      vendorId: user.vendorId,
      isActive: user.isActive,
    };
  },
});
