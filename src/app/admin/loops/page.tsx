'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { formatPrice, formatDuration } from '@/lib/utils'
import { MUSICAL_KEYS } from '@/hooks/use-filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoopsPage() {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingLoop, setEditingLoop] = useState<{
    id: string
    title: string
    genre_id: string | null
    bpm: number
    key: string
    price: number
  } | null>(null)

  const [editTitle, setEditTitle] = useState('')
  const [editGenreId, setEditGenreId] = useState<string>('')
  const [editBpm, setEditBpm] = useState('')
  const [editKey, setEditKey] = useState('')
  const [editPrice, setEditPrice] = useState('')

  const utils = trpc.useUtils()
  const { data: loopsData, isLoading } = trpc.loops.list.useQuery({ limit: 100 })
  const { data: genres } = trpc.genres.list.useQuery()

  const updateLoop = trpc.loops.update.useMutation({
    onSuccess: () => {
      utils.loops.list.invalidate()
      setIsEditOpen(false)
      toast.success('Loop updated successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteLoop = trpc.loops.delete.useMutation({
    onSuccess: () => {
      utils.loops.list.invalidate()
      toast.success('Loop deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleEdit = (loop: {
    id: string
    title: string
    genre_id: string | null
    bpm: number
    key: string
    price: number
  }) => {
    setEditingLoop(loop)
    setEditTitle(loop.title)
    setEditGenreId(loop.genre_id || '')
    setEditBpm(loop.bpm.toString())
    setEditKey(loop.key)
    setEditPrice((loop.price / 100).toFixed(2))
    setIsEditOpen(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingLoop) return

    updateLoop.mutate({
      id: editingLoop.id,
      title: editTitle,
      genreId: editGenreId || null,
      bpm: parseInt(editBpm),
      key: editKey,
      price: Math.round(parseFloat(editPrice) * 100),
    })
  }

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteLoop.mutate({ id })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Loops</h1>
          <p className="text-muted-foreground">
            Edit or delete existing loops
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/upload">Upload New</Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>BPM</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : loopsData?.loops.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No loops yet. Upload one to get started.
                </TableCell>
              </TableRow>
            ) : (
              loopsData?.loops.map((loop) => (
                <TableRow key={loop.id}>
                  <TableCell className="font-medium">{loop.title}</TableCell>
                  <TableCell>
                    {loop.genres ? (
                      <Badge variant="secondary">{loop.genres.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{loop.bpm}</TableCell>
                  <TableCell>{loop.key}</TableCell>
                  <TableCell>{formatDuration(loop.duration)}</TableCell>
                  <TableCell>{formatPrice(loop.price)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(loop)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(loop.id, loop.title)}
                        disabled={deleteLoop.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Loop</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <Select value={editGenreId} onValueChange={setEditGenreId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No genre</SelectItem>
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
                <Select value={editKey} onValueChange={setEditKey}>
                  <SelectTrigger>
                    <SelectValue />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">BPM</label>
                <Input
                  type="number"
                  value={editBpm}
                  onChange={(e) => setEditBpm(e.target.value)}
                  min="1"
                  max="300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price (USD)</label>
                <Input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateLoop.isPending}>
                {updateLoop.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
