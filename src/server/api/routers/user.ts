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
        where: { email: input.email.trim() },
      });
      const doesUserNameExist = await ctx.prisma.user.findUnique({
        where: { name: input.name.trim() },
      });
      if (doesUserNameExist) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }
      if (doesUserExist) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Account with that email already exists",
        });
      }
      const newUser = await ctx.prisma.user.create({
        data: {
          email: input.email.trim(),
          password: await bycrypt.hash(input.password, 10),
          name: input.name.trim(),
          role: "USER",
          emailVerified: new Date(),
          image: 'https://booker-tesis.s3.amazonaws.com/default-booker-avatar.jpeg',
        },
      });
      return newUser;
    }),
  findById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
       const user = await  ctx.prisma.user.findUnique({ where: { id: input.id }, });
       const reviews = await ctx.prisma.userReview.findMany({ where: { toUserId: input.id } });
       return { ...user, reviewsPosted: reviews };
    }),
  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        password: z.string().optional(),
        picture: z.string().optional(),
        isSettings: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const doesUserExist = await ctx.prisma.user.findFirst({
        where: { email: input.email.trim(), id: { not: input.id } },
      });
      const doesUserNameExist = await ctx.prisma.user.findFirst({
        where: { name: input.name.trim(), id: { not: input.id } },
      });
      if (doesUserNameExist && !input.isSettings) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }
      if (doesUserExist && !input.isSettings) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Account with that email already exists",
        });
      }
      const updateInput: any = {
        email: input.email,
        name: input.name,
        image: input.picture,
      };
      if (input.password) {
        updateInput.password = await bycrypt.hash(input.password, 10);
      }
      return await ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: updateInput,
      });
    }),
});
