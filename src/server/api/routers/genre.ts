import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const genreRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  findByName: publicProcedure.input(z.object({ name: z.string() })).query( async ({ctx, input}) => {
    return ctx.prisma.genre.findFirst({ where: { name: input.name}})
  }),
  getAll: publicProcedure.query( async (opts) => {
    return await opts.ctx.prisma.genre.findMany();
  }) 
});
