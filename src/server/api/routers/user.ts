import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcrypt";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const usersRouter = createTRPCRouter({
  verifyPassword: protectedProcedure
    .input(z.object({ password: z.string() }))
    .query(async ({ ctx, input }) => {
      const userFinded = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, ctx.session!.user!.id))
        .limit(1);
      if (!userFinded || userFinded.length === 0 || !userFinded[0])
        return { error: "Usuario no encontrado" };
      const user = userFinded[0];
      const isBcryptMatch = await bcrypt.compare(input.password, user.password);
      if (isBcryptMatch) {
        return { ok: true };
      } else {
        return { error: "Contraseña incorrecta" };
      }
    }),

  getAllUsersNames: protectedProcedure.query(async ({ ctx }) => {
    const usersNames = await ctx.db
      .select({
        name: users.name,
        id: users.id,
      })
      .from(users);
    return usersNames ?? [];
  }),
});
