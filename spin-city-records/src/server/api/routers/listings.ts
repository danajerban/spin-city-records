import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from 'zod';

export const listingsRouter = createTRPCRouter({
  getByAlbumId: publicProcedure
    .input(
      z.object({
        albumId: z.string()
      }),
    )
    .query( async ({ctx, input}) => {
      const {albumId} = input
      try {
        const listings = await ctx.prisma.listing.findMany({
          where: {albumId}
        })
        return listings
      } catch (e) {
        console.log(e)
      } 
    }),
  getByUserId: publicProcedure
    .input(z.string())
    .query( async ({ctx, input}) => {
      try {
        const listings = await ctx.prisma.listing.findMany({
          where: {
            userId: input
          }
        })
        return listings;
      } catch (e) {
        console.log(e)
      }
    })
});