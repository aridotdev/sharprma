import { db } from "~/server/database";
import { userRma } from "~/server/database/schema/user-rma";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID is required",
      });
    }

    await db.delete(userRma).where(eq(userRma.id, parseInt(id)));

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete user",
    });
  }
});
