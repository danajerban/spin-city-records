import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const collectionRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const collections = await ctx.prisma.collection.findMany({
        include: {
          albums: {
            include: {
              artist: true,
              listings: {
                where: { orderId: null },
              },
              Collection: true,
            },
          },
        },
      });
      return collections;
    } catch (e) {
      console.log(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch collections",
      });
    }
  }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;
      try {
        const collection = await ctx.prisma.collection.findUnique({
          where: { id },
          include: {
            albums: {
              include: {
                artist: true,
                listings: {
                  where: { orderId: null },
                },
                Collection: true,
              },
            },
          },
        });

        if (!collection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Collection with ID ${id} not found`,
          });
        }

        return collection;
      } catch (e) {
        console.log(e);
        if (e instanceof TRPCError) {
          throw e;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch collection",
        });
      }
    }),

  getByUserId: privateProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      try {
        const collections = await ctx.prisma.collection.findMany({
          where: {
            userId,
          },
          include: {
            albums: {
              include: {
                artist: true,
                listings: {
                  where: { orderId: null },
                },
                Collection: true,
              },
            },
          },
        });
        return collections;
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch collections",
        });
      }
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, userId } = input;
      try {
        const collection = await ctx.prisma.collection.create({
          data: {
            name: name,
            userId: userId,
          },
        });
        return collection;
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create collection",
        });
      }
    }),

  addAlbum: privateProcedure
    .input(
      z.object({
        collectionId: z.string(),
        albumId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { collectionId, albumId } = input;
      try {
        const collection = await ctx.prisma.collection.update({
          where: { id: collectionId },
          data: {
            albums: {
              connect: {
                id: albumId,
              },
            },
          },
        });
        return collection;
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add album to collection",
        });
      }
    }),

  removeAlbum: privateProcedure
    .input(
      z.object({
        collectionId: z.string(),
        albumId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { collectionId, albumId } = input;
      try {
        const collection = await ctx.prisma.collection.update({
          where: { id: collectionId },
          data: {
            albums: {
              disconnect: {
                id: albumId,
              },
            },
          },
        });
        return collection;
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove album from collection",
        });
      }
    }),
});
