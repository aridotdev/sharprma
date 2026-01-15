import { db } from "~/server/database";
import { userRma } from "~/server/database/schema/user-rma";
import {
  insertUserSchema,
  selectUserSchema,
} from "~/server/database/schema/user-rma";
import { eq } from "drizzle-orm";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID is required",
      });
    }

    const body = await readBody(event);
    const validatedData = insertUserSchema.partial().parse(body);

    const [user] = await db
      .update(userRma)
      .set(validatedData)
      .where(eq(userRma.id, parseInt(id)))
      .returning();

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    return selectUserSchema.parse(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Validation error",
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update user",
    });
  }
});
