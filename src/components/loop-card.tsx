'use client'

import { LoopWithGenre } from '@/lib/database.types'
import { formatPrice, formatDuration } from '@/lib/utils'
import { useGlobalAudioPlayer } from '@/hooks/use-audio-player'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Music } from 'lucide-react'
import { PurchaseButton } from './purchase-button'

interface LoopCardProps {
  loop: LoopWithGenre
}

export function LoopCard({ loop }: LoopCardProps) {
  const { currentLoopId, isPlaying, toggle, currentTime, duration } = useGlobalAudioPlayer()

  const isCurrentLoop = currentLoopId === loop.id
  const isCurrentlyPlaying = isCurrentLoop && isPlaying
  const progress = isCurrentLoop && duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        {/* Album art / play button area */}
        <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Music className="h-12 w-12 text-primary/40" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
            <Button
              size="lg"
              variant="secondary"
              className="h-14 w-14 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={() => toggle(loop.id, loop.preview_url)}
            >
              {isCurrentlyPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
          </div>

          {/* Progress bar */}
          {isCurrentLoop && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Loop info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold truncate">{loop.title}</h3>
            {loop.genres && (
              <Badge variant="secondary" className="mt-1">
                {loop.genres.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{loop.bpm} BPM</span>
            <span>·</span>
            <span>{loop.key}</span>
            <span>·</span>
            <span>{formatDuration(loop.duration)}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold">{formatPrice(loop.price)}</span>
            <PurchaseButton loop={loop} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
