import { z } from "zod";
import bycrypt from "bcryptjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { error } from "console";
import { TRPCError } from "@trpc/server";

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
    .input(
      z.object({ email: z.string(), password: z.string(), name: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const doesUserExist = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      const doesUserNameExist = await ctx.prisma.user.findUnique({
        where: { name: input.name },
      });
      if (doesUserNameExist) {
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'Username already exists',
          });
      };
      if (doesUserExist)  {
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'Account with that email already exists',
          });
      };
      const newUser = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: await bycrypt.hash(input.password, 10),
          name: input.name,
          role: "USER",
          emailVerified: new Date(),
        },
      });
      return newUser;
    }),
  findById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.user.findUnique({ where: { id: input.id } });
    }),
});
