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
        }
      });
    }),
  createPublication: protectedProcedure
    .input(
      z.object({
        bookId: z.string(),
        imgs: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newPublication = await ctx.prisma.bookPublication.create({
        data: {
          bookId: input.bookId,
          comment: "Nueva publicación",
          isActive: true,
        },
      });
      await createPublicationImages(ctx.prisma, newPublication.id, input.imgs);
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
