import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

export const catalogRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAllByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.catalog.findMany({
        where: {
          userId: input.userId,
        },
      });
    }),
  createCatalog: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;
      const { ctx } = opts;
      const newCatalog = await ctx.prisma.catalog.create({
        data: {
          name: input.name,
          userId: input.userId,
          description: input.description,
        },
      });
      return newCatalog;
    }),
  deleteCatalog: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      await opts.ctx.prisma.catalog.delete({ where: { id: opts.input.id } });
    }),
});
