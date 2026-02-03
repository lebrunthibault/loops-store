'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export interface Filters {
  genreId?: string
  bpmMin?: number
  bpmMax?: number
  key?: string
}

export function useFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: Filters = {
    genreId: searchParams.get('genre') ?? undefined,
    bpmMin: searchParams.get('bpmMin') ? parseInt(searchParams.get('bpmMin')!) : undefined,
    bpmMax: searchParams.get('bpmMax') ? parseInt(searchParams.get('bpmMax')!) : undefined,
    key: searchParams.get('key') ?? undefined,
  }

  const setFilter = useCallback(
    (key: keyof Filters, value: string | number | undefined) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value === undefined || value === '') {
        params.delete(key === 'genreId' ? 'genre' : key)
      } else {
        params.set(key === 'genreId' ? 'genre' : key, String(value))
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const setFilters = useCallback(
    (newFilters: Partial<Filters>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(newFilters).forEach(([key, value]) => {
        const paramKey = key === 'genreId' ? 'genre' : key
        if (value === undefined || value === '') {
          params.delete(paramKey)
        } else {
          params.set(paramKey, String(value))
        }
      })

      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const clearFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const hasFilters = Object.values(filters).some((v) => v !== undefined)

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasFilters,
  }
}

// Musical keys for filtering
export const MUSICAL_KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
]
