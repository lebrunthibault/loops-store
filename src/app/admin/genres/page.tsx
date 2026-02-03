'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { slugify } from '@/lib/utils'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function GenresPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingGenre, setEditingGenre] = useState<{
    id: string
    name: string
    slug: string
  } | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const utils = trpc.useUtils()
  const { data: genres, isLoading } = trpc.genres.list.useQuery()

  const createGenre = trpc.genres.create.useMutation({
    onSuccess: () => {
      utils.genres.list.invalidate()
      setIsOpen(false)
      resetForm()
      toast.success('Genre created successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateGenre = trpc.genres.update.useMutation({
    onSuccess: () => {
      utils.genres.list.invalidate()
      setIsOpen(false)
      resetForm()
      toast.success('Genre updated successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteGenre = trpc.genres.delete.useMutation({
    onSuccess: () => {
      utils.genres.list.invalidate()
      toast.success('Genre deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const resetForm = () => {
    setName('')
    setSlug('')
    setEditingGenre(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingGenre) {
      updateGenre.mutate({
        id: editingGenre.id,
        name,
        slug: slug || slugify(name),
      })
    } else {
      createGenre.mutate({
        name,
        slug: slug || slugify(name),
      })
    }
  }

  const handleEdit = (genre: { id: string; name: string; slug: string }) => {
    setEditingGenre(genre)
    setName(genre.name)
    setSlug(genre.slug)
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this genre?')) {
      deleteGenre.mutate({ id })
    }
  }

  const isSubmitting = createGenre.isPending || updateGenre.isPending

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Genres</h1>
          <p className="text-muted-foreground">
            Manage music genres for your loops
          </p>
        </div>

        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Genre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGenre ? 'Edit Genre' : 'Add New Genre'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!editingGenre) {
                      setSlug(slugify(e.target.value))
                    }
                  }}
                  placeholder="e.g. Lo-Fi"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. lo-fi"
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier. Auto-generated if left empty.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingGenre ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : genres?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No genres yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              genres?.map((genre) => (
                <TableRow key={genre.id}>
                  <TableCell className="font-medium">{genre.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {genre.slug}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(genre.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(genre)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(genre.id)}
                        disabled={deleteGenre.isPending}
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
    </div>
  )
}
