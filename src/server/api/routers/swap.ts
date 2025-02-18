import { Book, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const InitialSwapRequestData = z.object({
  requesterId: z.string(),
  holderId: z.string(),
  holderBookId: z.string(),
});

export const swapRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  findSwapByUsersIdsAndBookId: protectedProcedure
    .input(InitialSwapRequestData)
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.swapRequest.findFirst({
        where: {
          requesterId: input.requesterId,
          holderId: input.holderId,
          holderBookId: input.holderBookId,
          status: {
            in: ["PENDING_HOLDER", "PENDING_REQUESTER"],
          },
        },
      });
    }),
  updateSwapRequest: protectedProcedure
    .input(
      z.object({
        swapId: z.string(),
        status: z.enum(["ACCEPTED", "REJECTED", "CANCELLED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedRequest = await ctx.prisma.swapRequest.update({
        where: {
          id: input.swapId,
        },
        data: {
          status: input.status,
        },
      });
      if (input.status === "ACCEPTED") {
        await updateSwapedBooksStatus(
          ctx.prisma,
          updatedRequest.requesterBookId ?? "",
          updatedRequest.holderBookId,
        );
        await cancelAllSwapRequestsOfSwappedBook(ctx.prisma, input.swapId);
        await createNotification(
          ctx.prisma,
          updatedRequest.holderId,
          updatedRequest.requesterId,
          "Ha confirmado el intercambio!",
        );
      } else if (input.status === "REJECTED") {
        await createNotification(
          ctx.prisma,
          updatedRequest.holderId,
          updatedRequest.requesterId,
          "Ha rechazado el intercambio!",
        );
      } else if (input.status === 'CANCELLED') {
        await createNotification(
            ctx.prisma,
            updatedRequest.requesterId,
            updatedRequest.holderId,
            "Ha cancelado tu solicitud.",
          );
      }
    }),
  createInitialSwapRequest: protectedProcedure
    .input(InitialSwapRequestData)
    .mutation(async ({ ctx, input }) => {
      const existingRequestFromSameUser =
        await ctx.prisma.swapRequest.findFirst({
          where: {
            requesterId: input.holderId,
            holderId: input.requesterId,
            requesterBookId: input.holderBookId,
            status: {
              in: ["PENDING_REQUESTER", "ACCEPTED"],
            },
          },
        });
      if (Boolean(existingRequestFromSameUser)) {
        throw new TRPCError({
          message: "You have already selected this book in another request",
          code: "CONFLICT",
        });
      }
      const newSwapRequest = await ctx.prisma.swapRequest.create({
        data: {
          requesterId: input.requesterId,
          holderId: input.holderId,
          holderBookId: input.holderBookId,
        },
      });
      await createNotification(
        ctx.prisma,
        input.holderId,
        input.requesterId,
        "Te enviado una solicitud de intercambio",
      );
      return newSwapRequest;
    }),
  findByUserId: protectedProcedure
    .input(
      z.object({ id: z.string(), filter: z.enum(["ALL", "RECEIVED", "SENT"]) }),
    )
    .query(async ({ ctx, input }) => {
      console.log("input", input);
      if (input.filter === "ALL") {
        return await getAllSwapRequestsByUserId(ctx.prisma, input.id);
      } else if (input.filter === "SENT") {
        return await getSentSwapRequestByUserId(ctx.prisma, input.id);
      } else {
        return await getReceivedSwapRequestsByUserId(ctx.prisma, input.id);
      }
    }),
  findById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.swapRequest.findUnique({
        where: {
          id: input.id,
        },
        include: {
          holder: true,
          requester: true,
          holderBook: true,
          requesterBook: true,
        },
      });
    }),
  confirmRequesterSelection: protectedProcedure
    .input(
      z.object({
        swapId: z.string(),
        bookId: z.string(),
        requesterId: z.string(),
        holderId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isThereAnotherSwapWithRequesterBook =
        await ctx.prisma.swapRequest.findFirst({
          where: {
            requesterBookId: input.bookId,
            requesterId: input.requesterId,
            holderId: input.holderId,
            status: {
              in: ["ACCEPTED", "PENDING_REQUESTER"],
            },
          },
        });
      if (isThereAnotherSwapWithRequesterBook) {
        throw new TRPCError({
          message: "Books has already been selected by user in another request",
          code: "CONFLICT",
        });
      }
      await ctx.prisma.swapRequest.update({
        where: {
          id: input.swapId,
        },
        data: {
          requesterBookId: input.bookId,
          status: "PENDING_REQUESTER",
        },
      });
      await createNotification(
        ctx.prisma,
        input.requesterId,
        input.holderId,
        "Ha seleccionado un libro de tu librería",
      );
    }),
});

const getAllSwapRequestsByUserId = async (prisma: PrismaClient, id: string) => {
  console.log("id", id);
  return await prisma.swapRequest.findMany({
    where: {
      OR: [
        {
          requesterId: id,
        },
        {
          holderId: id,
        },
      ],
    },
    include: {
      requester: true,
      holder: true,
      holderBook: true,
      requesterBook: true,
    },
    orderBy: {
        createdAt: 'desc'
    }
  });
};

const getSentSwapRequestByUserId = async (prisma: PrismaClient, id: string) => {
  console.log("id", id);
  return await prisma.swapRequest.findMany({
    where: {
      requesterId: id,
    },
    include: {
      requester: true,
      holder: true,
      holderBook: true,
      requesterBook: true,
    },
    orderBy: {
        createdAt: 'desc'
    }
  });
};

const getReceivedSwapRequestsByUserId = async (
  prisma: PrismaClient,
  id: string,
) => {
  return await prisma.swapRequest.findMany({
    where: {
      holderId: id,
    },
    include: {
      requester: true,
      holder: true,
      holderBook: true,
      requesterBook: true,
    },
    orderBy: {
        createdAt: 'desc'
    }
  });
};

const updateSwapedBooksStatus = async (
  prisma: PrismaClient,
  requesterBookId: string,
  holderBookId: string,
) => {
  await prisma.book.updateMany({
    where: {
      id: {
        in: [requesterBookId, holderBookId],
      },
    },
    data: {
      status: "SWAPPED",
    },
  });
};

// ** After a book is swapped, we must cancel all other requst where that book has beed selected, as it is no longer available
const cancelAllSwapRequestsOfSwappedBook = async (
  prisma: PrismaClient,
  swapId: string,
) => {
  const foundSwap = await prisma.swapRequest.findUnique({
    where: {
      id: swapId,
    },
  });
  if (foundSwap) {
    await prisma.swapRequest.updateMany({
      where: {
        id: {
          not: foundSwap.id,
        },
        OR: [
          {
            requesterBookId: {
              in: [foundSwap.requesterBookId ?? "", foundSwap?.holderBookId],
            },
          },
          {
            holderBookId: {
              in: [foundSwap?.requesterBookId ?? "", foundSwap.holderBookId],
            },
          },
        ],
      },
      data: {
        status: "BOOK_NOT_AVAILABLE",
      },
    });
  }
};

const createNotification = async (
  prisma: PrismaClient,
  userId: string,
  secondaryUserId: string,
  content: string,
) => {
  const userFound = await prisma.user.findFirst({
    where: { id: secondaryUserId },
  });
  const newNotif = await prisma.notification.create({
    data: {
      userId: userId,
      content: `${userFound?.name} - ${content}`,
    },
  });
  return newNotif;
};
