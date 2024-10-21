import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users, containers } from "~/server/db/schema";

export const containerRouter = createTRPCRouter({
  saveContainer: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        fruto: z.string(),
        gramosPorClamshell: z.number(),
        clamshellsPorCaja: z.number(),
        cajasPorPallet: z.number(),
        palletsPorContainer: z.number(),
        fechaEmpaquetacion: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        console.log("input.id", input.id);
        await ctx.db
          .update(containers)
          .set({
            ...input,
          })
          .where(eq(containers.id, input.id));
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
      await ctx.db.insert(containers).values({
        ...input,
        createdById: userId,
      });
    }),

  getAllContainers: protectedProcedure.query(async ({ ctx, input }) => {
    const mts = await ctx.db.select().from(containers);
    return mts ?? [];
  }),

  eliminarContainer: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(containers).where(eq(containers.id, input.id));
    }),
});
