'use client'

import { trpc } from '@/lib/trpc'
import { useFilters, MUSICAL_KEYS } from '@/hooks/use-filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Filter } from 'lucide-react'

export function LoopFilters() {
  const { filters, setFilter, clearFilters, hasFilters } = useFilters()
  const { data: genres } = trpc.genres.list.useQuery()

  return (
    <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Genre filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Genre</label>
        <Select
          value={filters.genreId ?? 'all'}
          onValueChange={(value) =>
            setFilter('genreId', value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genres</SelectItem>
            {genres?.map((genre) => (
              <SelectItem key={genre.id} value={genre.id}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Key</label>
        <Select
          value={filters.key ?? 'all'}
          onValueChange={(value) =>
            setFilter('key', value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All keys" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All keys</SelectItem>
            {MUSICAL_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* BPM range */}
      <div className="space-y-4">
        <label className="text-sm font-medium">BPM Range</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.bpmMin ?? ''}
            onChange={(e) =>
              setFilter(
                'bpmMin',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className="w-20"
            min={1}
            max={300}
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.bpmMax ?? ''}
            onChange={(e) =>
              setFilter(
                'bpmMax',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className="w-20"
            min={1}
            max={300}
          />
        </div>
      </div>
    </div>
  )
}
