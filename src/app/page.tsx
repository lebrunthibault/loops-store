'use client'

import { Suspense } from 'react'
import { LoopGrid } from '@/components/loop-grid'
import { LoopFilters } from '@/components/loop-filters'

export default function Home() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Piano Loops</h1>
        <p className="text-muted-foreground">
          Discover high-quality piano loops for your music production
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Suspense fallback={<div className="h-64 bg-muted rounded-lg animate-pulse" />}>
            <LoopFilters />
          </Suspense>
        </aside>

        {/* Loop grid */}
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <LoopGrid />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
