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
  
    getSecretMessage: protectedProcedure.query(() => {
      return "you can now see this secret message!";
    }),
  });