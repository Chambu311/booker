import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userReviewRouter = createTRPCRouter({
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
  createReview: protectedProcedure
    .input(
      z.object({
        fromUserId: z.string(),
        toUserId: z.string(),
        rating: z.number(),
        comment: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.userReview.create({
        data: {
          ...input,
        },
      });
    }),
  canIPostAReview: protectedProcedure
    .input(z.object({ fromUserId: z.string(), toUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const query = await ctx.prisma.swapRequest.findFirst({
        where: {
          requesterId: {
            in: [input.fromUserId, input.toUserId],
          },
          holderId: {
            in: [input.fromUserId, input.toUserId],
          },
          status: "ACCEPTED",
        },
      });
      if (query) {
        const reviewsPosted = await ctx.prisma.userReview.findMany({
          where: {
            fromUserId: input.fromUserId,
            toUserId: input.toUserId,
          },
        });
        if (reviewsPosted.length > 0) return null;
        return query;
      }
      return null;
    }),
  getUserReviewsRating: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      let count = 0;
      const reviews = await ctx.prisma.userReview.findMany({
        where: {
          toUserId: input.userId,
        },
      });
      for (const review of reviews) {
        count += review.rating;
      }
      return count / reviews.length;
    }),
});
