import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const loopsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        genreId: z.string().uuid().optional(),
        bpmMin: z.number().int().min(1).max(300).optional(),
        bpmMax: z.number().int().min(1).max(300).optional(),
        key: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().uuid().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('loops')
        .select('*, genres(*)')
        .order('created_at', { ascending: false })
        .limit(input?.limit ?? 20)

      if (input?.genreId) {
        query = query.eq('genre_id', input.genreId)
      }

      if (input?.bpmMin) {
        query = query.gte('bpm', input.bpmMin)
      }

      if (input?.bpmMax) {
        query = query.lte('bpm', input.bpmMax)
      }

      if (input?.key) {
        query = query.eq('key', input.key)
      }

      if (input?.cursor) {
        query = query.lt('id', input.cursor)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return {
        loops: data,
        nextCursor: data.length === (input?.limit ?? 20) ? data[data.length - 1]?.id : null,
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('loops')
        .select('*, genres(*)')
        .eq('id', input.id)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loop not found',
        })
      }

      return data
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        genreId: z.string().uuid().nullable(),
        bpm: z.number().int().min(1).max(300),
        key: z.string().min(1).max(10),
        duration: z.number().int().min(1),
        price: z.number().int().min(0),
        audioUrl: z.string().url(),
        previewUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient()

      const { data, error } = await supabase
        .from('loops')
        .insert({
          title: input.title,
          genre_id: input.genreId,
          bpm: input.bpm,
          key: input.key,
          duration: input.duration,
          price: input.price,
          audio_url: input.audioUrl,
          preview_url: input.previewUrl,
        })
        .select('*, genres(*)')
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(100).optional(),
        genreId: z.string().uuid().nullable().optional(),
        bpm: z.number().int().min(1).max(300).optional(),
        key: z.string().min(1).max(10).optional(),
        duration: z.number().int().min(1).optional(),
        price: z.number().int().min(0).optional(),
        audioUrl: z.string().url().optional(),
        previewUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient()
      const { id, ...updates } = input

      const updateData: Record<string, unknown> = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.genreId !== undefined) updateData.genre_id = updates.genreId
      if (updates.bpm !== undefined) updateData.bpm = updates.bpm
      if (updates.key !== undefined) updateData.key = updates.key
      if (updates.duration !== undefined) updateData.duration = updates.duration
      if (updates.price !== undefined) updateData.price = updates.price
      if (updates.audioUrl !== undefined) updateData.audio_url = updates.audioUrl
      if (updates.previewUrl !== undefined) updateData.preview_url = updates.previewUrl

      const { data, error } = await supabase
        .from('loops')
        .update(updateData)
        .eq('id', id)
        .select('*, genres(*)')
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createAdminClient()

      const { error } = await supabase
        .from('loops')
        .delete()
        .eq('id', input.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),
})
