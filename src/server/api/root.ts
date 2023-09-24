import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { bookRouter } from "./routers/book";
import { genreRouter } from "./routers/genre";
import { publicationRouter } from "./routers/bookPublication";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  user: userRouter,
  book: bookRouter,
  publication: publicationRouter,
  genre: genreRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
