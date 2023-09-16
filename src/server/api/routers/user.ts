import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";


export const userRouter = createTRPCRouter({
    getAll: publicProcedure.query(({ ctx }) => {
      return ctx.prisma.user.findMany();
    }),
    getUserByEmail: publicProcedure.input(z.object({email: z.string()})).query( async ({ctx, input}) => {
        return ctx.prisma.user.findUnique({ where: {
            email: input.email,
        }})
    }),
    getSecretMessage: protectedProcedure.query(() => {
      return "you can now see this secret message!";
    }),
  });