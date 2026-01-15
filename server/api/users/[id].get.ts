import { db } from "~/server/database";
import { userRma } from "~/server/database/schema/user-rma";
import { selectUserSchema } from "~/server/database/schema/user-rma";
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

    const user = await db
      .select()
      .from(userRma)
      .where(eq(userRma.id, parseInt(id)))
      .get();

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    return selectUserSchema.parse(user);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user",
    });
  }
});
