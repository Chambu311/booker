import { z } from "zod";
import bycrypt from "bcryptjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });
    }),
  createUser: publicProcedure
    .input(z.object({ email: z.string(), password: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
        console.log('im here', input);
      const doesUserExist = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (doesUserExist) return;
      const newUser = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: await bycrypt.hash(input.password, 10),
          name: input.name,
          role: 'USER',
          emailVerified: new Date(),
        },
      });
      console.log('new user', newUser);
      return newUser;
    }),
});
