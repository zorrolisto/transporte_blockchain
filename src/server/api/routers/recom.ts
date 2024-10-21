/*import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { recompensas, users } from "~/server/db/schema";

export const recompensasRouter = createTRPCRouter({
  comprar: protectedProcedure
    .input(z.object({ id: z.number(), price: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existingReward = await ctx.db
        .select()
        .from(recompensas)
        .where(
          and(
            eq(recompensas.userId, ctx.session!.user!.id),
            eq(recompensas.tipoId, input.id),
          ),
        );
      const first = existingReward[0];

      if (first) {
        // Update the quantity if the reward already exists
        await ctx.db
          .update(recompensas)
          .set({ quantity: sql`${recompensas.quantity} + ${1}` })
          .where(
            and(
              eq(recompensas.userId, ctx.session!.user!.id),
              eq(recompensas.tipoId, input.id),
            ),
          );
      } else {
        await ctx.db.insert(recompensas).values({
          userId: ctx.session!.user!.id,
          tipoId: input.id,
          createdById: ctx.session!.user!.id,
          quantity: 1,
        });
      }
      await ctx.db
        .update(users)
        .set({ tokens: sql`${users.tokens} - ${input.price}` })
        .where(eq(users.id, ctx.session!.user!.id));
    }),

  getAllRecompensas: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.id) {
        const mts = await ctx.db
          .select()
          .from(recompensas)
          .where(eq(recompensas.userId, input.id));
        return mts ?? [];
      }
      const mts = await ctx.db.select().from(recompensas);
      return mts ?? [];
    }),
});*/
