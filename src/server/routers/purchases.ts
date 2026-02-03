import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const purchasesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('purchases')
      .select('*, loops(*, genres(*))')
      .eq('user_id', ctx.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data
  }),

  checkPurchased: protectedProcedure
    .input(z.object({ loopId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from('purchases')
        .select('id')
        .eq('user_id', ctx.user.id)
        .eq('loop_id', input.loopId)
        .single()

      return { purchased: !!data }
    }),

  createCheckout: protectedProcedure
    .input(z.object({ loopId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if already purchased
      const { data: existingPurchase } = await ctx.supabase
        .from('purchases')
        .select('id')
        .eq('user_id', ctx.user.id)
        .eq('loop_id', input.loopId)
        .single()

      if (existingPurchase) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already purchased this loop',
        })
      }

      // Get loop details
      const { data: loop, error } = await ctx.supabase
        .from('loops')
        .select('*')
        .eq('id', input.loopId)
        .single()

      if (error || !loop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loop not found',
        })
      }

      // Create Stripe checkout session
      const stripe = getStripe()
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: loop.title,
                description: `Piano loop - ${loop.bpm} BPM, Key: ${loop.key}`,
              },
              unit_amount: loop.price,
            },
            quantity: 1,
          },
        ],
        metadata: {
          loop_id: loop.id,
          user_id: ctx.user.id,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      })

      return { url: session.url }
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ loopId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify purchase
      const { data: purchase } = await ctx.supabase
        .from('purchases')
        .select('id')
        .eq('user_id', ctx.user.id)
        .eq('loop_id', input.loopId)
        .single()

      if (!purchase) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You have not purchased this loop',
        })
      }

      // Get loop to find the file path
      const { data: loop, error } = await ctx.supabase
        .from('loops')
        .select('audio_url, title')
        .eq('id', input.loopId)
        .single()

      if (error || !loop) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loop not found',
        })
      }

      // Extract file path from URL and create signed URL
      const supabase = createAdminClient()
      const urlParts = loop.audio_url.split('/loops-full/')
      const filePath = urlParts[urlParts.length - 1]

      const { data: signedUrl, error: signedUrlError } = await supabase.storage
        .from('loops-full')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (signedUrlError || !signedUrl) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate download URL',
        })
      }

      return { url: signedUrl.signedUrl, filename: `${loop.title}.mp3` }
    }),
})
