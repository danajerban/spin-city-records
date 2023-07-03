import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";

export const sellersRouter = createTRPCRouter({
  create: privateProcedure
  .input(
    z.object({
      name: z.string(),
      bio: z.string(),
      location: z.string()
    })
  )
  .mutation(
      async ({ ctx, input }) => {
        try {
          // Create Stripe Account
          const account = await ctx.stripe.accounts.create({ 
            type : 'express',
            email: ctx.user.emailAddresses[0]?.emailAddress as unknown as string,
            business_type: 'individual'
          }) 

          const {url} = await ctx.stripe.accountLinks.create({
            account: account?.id,
            refresh_url: 'http://localhost:3000/profile/startSelling' + ctx.user.id,
            return_url: 'http://localhost:3000/profile/createListing' + ctx.user.id,
            type: 'account_onboarding'
          })
          // Add account to DB
          await ctx.prisma.seller.create({
            data: {
              stripeId: account.id,
              name: input?.name,
              bio: input?.bio,
              rating: 0,
              location: input?.location
            }
          })
          // Attach account to clerk DB
          await clerkClient.users.updateUser(ctx.user.id, {
            privateMetadata: {
              stripeId: account.id
            }
          })
          
          return url 
        } catch (e) {
          console.log(e)
          console.log('Failed to create a Stripe account.');
        }
      }
    )
});
