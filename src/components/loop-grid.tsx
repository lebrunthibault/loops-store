'use client'

import { trpc } from '@/lib/trpc'
import { useFilters } from '@/hooks/use-filters'
import { LoopCard } from './loop-card'
import { Music } from 'lucide-react'

export function LoopGrid() {
  const { filters } = useFilters()

  const { data, isLoading, error } = trpc.loops.list.useQuery({
    genreId: filters.genreId,
    bpmMin: filters.bpmMin,
    bpmMax: filters.bpmMax,
    key: filters.key,
    limit: 20,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-muted rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load loops</p>
      </div>
    )
  }

  if (!data?.loops.length) {
    return (
      <div className="text-center py-12">
        <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No loops found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.loops.map((loop) => (
        <LoopCard key={loop.id} loop={loop} />
      ))}
    </div>
  )
}
