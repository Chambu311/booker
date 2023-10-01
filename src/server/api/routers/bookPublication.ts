import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const publicationRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  findByBookId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.bookPublication.findFirst({
        where: { bookId: input.id },
        include: {
          book: true,
          images: true,
        },
      });
    }),
  createPublication: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        imgs: z.string().array(),
        comment: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newPublication = await ctx.prisma.bookPublication.create({
        data: {
          bookId: input.bookId,
          comment: input.comment,
          isActive: true,
        },
      });
      await createPublicationImages(ctx.prisma, newPublication.id, input.imgs);
    }),
  pausePublication: protectedProcedure
    .input(z.object({ isActive: z.boolean(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const foundPub = await ctx.prisma.bookPublication.findUnique({
        where: { id: input.id },
      });
      if (foundPub) {
        await ctx.prisma.bookPublication.create({
          data: {
            ...foundPub,
            isActive: input.isActive,
          },
        });
      }
    }),
  getFeedPublications: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const pubs = await ctx.prisma.bookPublication.findMany({
        where: {
          book: {
            userId: {
              not: input.id,
            },
          },
          isActive: true,
        },
        include: {
          book: true,
          images: true,
        },
      });
      return pubs;
    }),
});

async function createPublicationImages(
  prisma: PrismaClient,
  publicationId: string,
  imgs: string[],
) {
  for (const image of imgs) {
    await prisma.publicationImage.create({
      data: {
        publicationId,
        src: image,
      },
    });
  }
}
