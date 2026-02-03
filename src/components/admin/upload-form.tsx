'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { MUSICAL_KEYS } from '@/hooks/use-filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Loader2, Music, Check } from 'lucide-react'
import { toast } from 'sonner'

interface UploadStep {
  label: string
  status: 'pending' | 'loading' | 'complete' | 'error'
}

export function UploadForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [genreId, setGenreId] = useState<string>('')
  const [bpm, setBpm] = useState('')
  const [key, setKey] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [steps, setSteps] = useState<UploadStep[]>([])

  const { data: genres } = trpc.genres.list.useQuery()
  const getUploadUrls = trpc.admin.getUploadUrls.useMutation()
  const createLoop = trpc.loops.create.useMutation()

  const updateStep = (index: number, status: UploadStep['status']) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, status } : step))
    )
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    // Get audio duration
    const audio = new Audio()
    audio.src = URL.createObjectURL(selectedFile)
    audio.onloadedmetadata = () => {
      setDuration(Math.round(audio.duration).toString())
      URL.revokeObjectURL(audio.src)
    }

    // Auto-fill title from filename
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
      setTitle(nameWithoutExt)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error('Please select an audio file')
      return
    }

    setIsUploading(true)
    setSteps([
      { label: 'Getting upload URLs', status: 'loading' },
      { label: 'Uploading full audio', status: 'pending' },
      { label: 'Generating preview', status: 'pending' },
      { label: 'Creating loop record', status: 'pending' },
    ])

    try {
      // Step 1: Get upload URLs
      const urls = await getUploadUrls.mutateAsync({
        filename: file.name,
        contentType: file.type,
      })
      updateStep(0, 'complete')

      // Step 2: Upload full audio
      updateStep(1, 'loading')
      const fullUploadResponse = await fetch(urls.fullUploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!fullUploadResponse.ok) {
        throw new Error('Failed to upload full audio')
      }
      updateStep(1, 'complete')

      // Step 3: Generate preview
      updateStep(2, 'loading')
      const previewFormData = new FormData()
      previewFormData.append('file', file)
      previewFormData.append('filename', file.name)

      const previewResponse = await fetch('/api/admin/preview', {
        method: 'POST',
        body: previewFormData,
      })

      if (!previewResponse.ok) {
        throw new Error('Failed to generate preview')
      }

      const { previewUrl } = await previewResponse.json()
      updateStep(2, 'complete')

      // Step 4: Create loop record
      updateStep(3, 'loading')
      await createLoop.mutateAsync({
        title,
        genreId: genreId || null,
        bpm: parseInt(bpm),
        key,
        duration: parseInt(duration),
        price: Math.round(parseFloat(price) * 100), // Convert to cents
        audioUrl: urls.fullPublicUrl,
        previewUrl,
      })
      updateStep(3, 'complete')

      toast.success('Loop uploaded successfully!')
      router.push('/admin/loops')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')

      // Mark current step as error
      setSteps((prev) =>
        prev.map((step) =>
          step.status === 'loading' ? { ...step, status: 'error' } : step
        )
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Loop</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Audio File</label>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  <span>{file.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Click to select an audio file
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Loop title"
              required
            />
          </div>

          {/* Genre and Key */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Genre</label>
              <Select value={genreId} onValueChange={setGenreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres?.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Key</label>
              <Select value={key} onValueChange={setKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select key" />
                </SelectTrigger>
                <SelectContent>
                  {MUSICAL_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* BPM and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">BPM</label>
              <Input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="120"
                min="1"
                max="300"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (seconds)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Auto-detected"
                min="1"
                required
              />
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Price (USD)</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.99"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Upload progress */}
          {steps.length > 0 && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  {step.status === 'loading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {step.status === 'complete' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {step.status === 'pending' && (
                    <div className="h-4 w-4 rounded-full border-2" />
                  )}
                  {step.status === 'error' && (
                    <div className="h-4 w-4 rounded-full bg-red-500" />
                  )}
                  <span
                    className={
                      step.status === 'complete'
                        ? 'text-muted-foreground'
                        : step.status === 'loading'
                        ? 'font-medium'
                        : ''
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Loop
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
