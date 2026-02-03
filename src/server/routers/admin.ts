import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const adminRouter = router({
  getStats: adminProcedure.query(async () => {
    const supabase = createAdminClient()

    const [loopsResult, purchasesResult, genresResult] = await Promise.all([
      supabase.from('loops').select('id', { count: 'exact', head: true }),
      supabase.from('purchases').select('id', { count: 'exact', head: true }),
      supabase.from('genres').select('id', { count: 'exact', head: true }),
    ])

    return {
      totalLoops: loopsResult.count ?? 0,
      totalPurchases: purchasesResult.count ?? 0,
      totalGenres: genresResult.count ?? 0,
    }
  }),

  getRecentPurchases: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const supabase = createAdminClient()

      const { data, error } = await supabase
        .from('purchases')
        .select('*, loops(title, price)')
        .order('created_at', { ascending: false })
        .limit(input.limit)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  getUploadUrls: adminProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        contentType: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient()
      const timestamp = Date.now()
      const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_')

      // Generate unique filenames
      const fullFilename = `${timestamp}-${sanitizedFilename}`
      const previewFilename = `${timestamp}-preview-${sanitizedFilename}`

      // Create signed upload URLs for both buckets
      const [fullUrlResult, previewUrlResult] = await Promise.all([
        supabase.storage
          .from('loops-full')
          .createSignedUploadUrl(fullFilename),
        supabase.storage
          .from('loops-preview')
          .createSignedUploadUrl(previewFilename),
      ])

      if (fullUrlResult.error || previewUrlResult.error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate upload URLs',
        })
      }

      // Get public URLs
      const { data: fullPublicUrl } = supabase.storage
        .from('loops-full')
        .getPublicUrl(fullFilename)

      const { data: previewPublicUrl } = supabase.storage
        .from('loops-preview')
        .getPublicUrl(previewFilename)

      return {
        fullUploadUrl: fullUrlResult.data.signedUrl,
        fullPublicUrl: fullPublicUrl.publicUrl,
        fullPath: fullUrlResult.data.path,
        previewUploadUrl: previewUrlResult.data.signedUrl,
        previewPublicUrl: previewPublicUrl.publicUrl,
        previewPath: previewUrlResult.data.path,
      }
    }),
})
