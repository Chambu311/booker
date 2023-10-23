import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { genreRouter } from "./genre";
import { PrismaClient } from "@prisma/client";

export const bookRouter = createTRPCRouter({
  getAllByUserId: protectedProcedure
    .input(z.object({ userId: z.string(), isPublished: z.boolean() }))
    .query(async ({ ctx, input }) => {
      let filteredBooks = [];
      const books = await ctx.prisma.book.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          publications: true,
          genre: true,
          user: true,
        },
      });
      if (input.isPublished) {
        filteredBooks = books.filter(
          (book) =>
            book.publications.length > 0 && book.publications[0]?.isActive,
        );
        return filteredBooks;
      }
      return books;
    }),
  createBook: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        title: z.string(),
        author: z.string(),
        genre: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async (opts) => {
      const { ctx, input } = opts;
      const genreId = await getGenreId(ctx.prisma, input.genre);
      const newBook = await ctx.prisma.book.create({
        data: {
          userId: input.userId,
          title: input.title,
          author: input.author,
          genreId: genreId ? genreId : "",
          description: input.description,
        },
      });
      return newBook;
    }),
  deleteBook: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.book.delete({ where: { id: input.id } });
    }),
  findById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.book.findUnique({ where: { id: input.id } });
    }),
});

async function getGenreId(prisma: PrismaClient, genreName: string) {
  const genreFound = await prisma.genre.findFirst({
    where: { name: genreName },
  });
  return genreFound?.id;
}
