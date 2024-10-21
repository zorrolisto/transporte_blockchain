import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users, embarcacion } from "~/server/db/schema";

export const embarqueRouter = createTRPCRouter({
  saveEmbarque: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        diasEnLlegar: z.number(),
        fechaEnvio: z.date(),
        paisOrigen: z.string(),
        nombre: z.string(),
        paisDestino: z.string(),
        tipoDeEnvio: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        console.log("input.id", input.id);
        await ctx.db
          .update(embarcacion)
          .set({
            ...input,
          })
          .where(eq(embarcacion.id, input.id));
        return;
      }
      const userRes = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, ctx.session!.user!.email!));
      if (!userRes[0]) {
        throw new Error("User not found");
      }
      const userId = userRes[0].id;
      return await ctx.db
        .insert(embarcacion)
        .values({
          ...input,
          createdById: userId,
        })
        .returning();
    }),

  getAllEmbarques: protectedProcedure.query(async ({ ctx, input }) => {
    const mts = await ctx.db.select().from(embarcacion);
    return mts ?? [];
  }),

  deleteEmbarcacion: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(embarcacion).where(eq(embarcacion.id, input.id));
    }),
});
