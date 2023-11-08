import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { genreRouter } from "./genre";
import { BookStatus, PrismaClient } from "@prisma/client";

export const bookRouter = createTRPCRouter({
  getAllByUserId: protectedProcedure
    .input(z.object({ userId: z.string(), isPublished: z.boolean() }))
    .query(async ({ ctx, input }) => {
      let filteredBooks = [];
      const books = await ctx.prisma.book.findMany({
        where: {
          userId: input.userId,
          status: {
            not: "DELETED",
          },
        },
        include: {
          genre: true,
          user: true,
          images: true,
        },
      });
      if (input.isPublished) {
        filteredBooks = books.filter((book) => book.status === "PUBLISHED");
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
        imgs: z.string().array(),
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
          genreId: genreId ?? "",
          description: input.description,
        },
      });
      await createBookImages(ctx.prisma, input.imgs, newBook.id);
      return newBook;
    }),
  deleteBook: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedBook = await ctx.prisma.book.update({
        where: {
          id: input.id,
        },
        data: {
          status: "DELETED",
        },
      });
      await updateSwapsWithDeletedBook(ctx.prisma, input.id);
      return deletedBook;
    }),

  findById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.book.findUnique({
        where: { id: input.id },
        include: {
          genre: true,
          images: true,
        },
      });
    }),
  getBooksFeed: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        genre: z.string().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereCondition: any = {
        userId: {
          not: input.userId,
        },
        status: "PUBLISHED",
      };

      if (input.genre !== null) {
        whereCondition.genre = {
          name: input.genre,
        };
      }
      return await ctx.prisma.book.findMany({
        where: whereCondition,
        include: {
          images: true,
          genre: true,
        },
      });
    }),
  updateBookStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(["PUBLISHED", "NOT_PUBLISHED", "SWAPPED"]),
        bookId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.book.update({
        where: {
          id: input.bookId,
        },
        data: {
          status: input.status,
        },
      });
    }),

  updateBook: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        author: z.string(),
        genre: z.string(),
        imgs: z.string().array(),
        description: z.string().optional(),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const genreId = await getGenreId(ctx.prisma, input.genre);
      const updatedBook = await ctx.prisma.book.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          author: input.author,
          description: input.description,
          genreId,
        },
      });
      if (input.imgs.length > 0) {
        await deleteBookImages(ctx.prisma, input.id);
        await createBookImages(ctx.prisma, input.imgs, input.id);
      }
      return updatedBook;
    }),
});

async function getGenreId(prisma: PrismaClient, genreName: string) {
  const genreFound = await prisma.genre.findFirst({
    where: { name: genreName },
  });
  return genreFound?.id;
}

async function deleteBookImages(prisma: PrismaClient, bookId: string) {
  await prisma.bookImage.deleteMany({
    where: {
      bookId,
    },
  });
}

async function createBookImages(
  prisma: PrismaClient,
  imgs: string[],
  bookId: string,
) {
  for (const img of imgs) {
    await prisma.bookImage.create({
      data: {
        src: img,
        bookId,
      },
    });
  }
}

async function updateSwapsWithDeletedBook(
  prisma: PrismaClient,
  bookId: string,
) {
  await prisma.swapRequest.updateMany({
    where: {
      OR: [
        {
          requesterBookId: bookId,
        },
        {
          holderBookId: bookId,
        },
      ],
      status: {
        notIn: ['CANCELLED', 'REJECTED']
      }
    },
    data: {
      status: "BOOK_NOT_AVAILABLE",
    },
  });
}
