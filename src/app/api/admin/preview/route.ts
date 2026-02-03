import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ffmpeg from 'fluent-ffmpeg'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

export async function POST(request: Request) {
  try {
    // Check admin status
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const filename = formData.get('filename') as string

    if (!file || !filename) {
      return NextResponse.json(
        { error: 'Missing file or filename' },
        { status: 400 }
      )
    }

    // Create temp directory if it doesn't exist
    const tempDir = join(tmpdir(), 'loops-preview')
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }

    // Save uploaded file to temp location
    const inputPath = join(tempDir, `input-${Date.now()}-${filename}`)
    const outputPath = join(tempDir, `preview-${Date.now()}-${filename}`)

    const arrayBuffer = await file.arrayBuffer()
    await writeFile(inputPath, Buffer.from(arrayBuffer))

    // Generate 30-second preview with fade out
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .setDuration(30)
        .audioFilters('afade=out:st=27:d=3')
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })

    // Read the preview file
    const { readFile } = await import('fs/promises')
    const previewBuffer = await readFile(outputPath)

    // Upload to Supabase Storage
    const adminClient = createAdminClient()
    const previewFilename = `${Date.now()}-preview-${filename}`

    const { error: uploadError } = await adminClient.storage
      .from('loops-preview')
      .upload(previewFilename, previewBuffer, {
        contentType: 'audio/mpeg',
      })

    if (uploadError) {
      throw new Error(`Failed to upload preview: ${uploadError.message}`)
    }

    // Get public URL
    const { data: publicUrl } = adminClient.storage
      .from('loops-preview')
      .getPublicUrl(previewFilename)

    // Clean up temp files
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})

    return NextResponse.json({
      previewUrl: publicUrl.publicUrl,
      previewPath: previewFilename,
    })
  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
