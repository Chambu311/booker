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
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.book.findMany({
        where: {
          userId: input.userId,
        },
        include: {
            publications: true,
            genre: true,
        }
      });
    }),
  createBook: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        title: z.string(),
        author: z.string(),
        genre: z.string()
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
          typeId: "clmnpcd2t0000yx5g02jfqy7p",
          genreId: genreId ? genreId : '',
        },
      });
      return newBook;
    }),
    deleteBook: protectedProcedure.input(z.object({ id: z.string()})).mutation( async ({ctx, input}) => {
        return await ctx.prisma.book.delete({ where: { id: input.id}})
    }),
    findById: protectedProcedure.input(z.object({id: z.string()})).query( async ({ctx, input}) => {
        return await ctx.prisma.book.findUnique({ where: { id: input.id }})
    })
});

async function getGenreId(prisma: PrismaClient, genreName: string) {
  const genreFound = await prisma.genre.findFirst({ where: { name: genreName } });
  return genreFound?.id;
}
