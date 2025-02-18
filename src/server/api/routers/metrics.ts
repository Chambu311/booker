import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const metricsRouter = createTRPCRouter({
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
  getUsersRankedBySwaps: protectedProcedure.query(async ({ ctx }) => {
    const ranking: any[] = await ctx.prisma.$queryRaw`
    SELECT
    u.id,
    u.name,
    COUNT(s.id) AS swapCount
  FROM
    User u
  LEFT JOIN
    SwapRequest s ON u.id = s.requesterId OR u.id = s.holderId
  WHERE
    s.status = 'ACCEPTED'
  GROUP BY
    u.id, u.name
  ORDER BY
    swapCount DESC
    `;
    return ranking;
  }),
  getGenresRankedBySwaps: protectedProcedure.query(async ({ ctx }) => {
    const ranking = await ctx.prisma.$queryRaw`
     SELECT
    g.name AS genre,
    COUNT(s.id) AS swapCount
  FROM
    Genre g
  LEFT JOIN
    Book b ON g.id = b.genreId
  LEFT JOIN
    SwapRequest s ON b.id = s.holderBookId OR b.id = s.requesterBookId
  WHERE
    s.status = 'ACCEPTED'
  GROUP BY
    g.name
  ORDER BY
    swapCount DESC
    `;
    return ranking;
  }),
  getBooksUploadedPerUser: protectedProcedure.query(async ({ ctx }) => {
    const ranking: any[] = await ctx.prisma.$queryRaw`
      SELECT 
        u.name,
        COUNT(b.id) as bookCount
      FROM 
        User u
      LEFT JOIN 
        Book b ON u.id = b.userId AND b.status != 'DELETED'
      GROUP BY 
        u.id, u.name
      ORDER BY 
        bookCount DESC
      LIMIT 10
    `;
    return ranking;
  }),
});
