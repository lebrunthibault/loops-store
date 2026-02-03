'use client'

import { useGlobalAudioPlayer } from '@/hooks/use-audio-player'
import { trpc } from '@/lib/trpc'
import { formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react'

export function AudioPlayer() {
  const {
    currentLoopId,
    isPlaying,
    currentTime,
    duration,
    volume,
    toggle,
    seek,
    setVolume,
    stop,
  } = useGlobalAudioPlayer()

  const { data: loop } = trpc.loops.getById.useQuery(
    { id: currentLoopId! },
    { enabled: !!currentLoopId }
  )

  if (!currentLoopId || !loop) {
    return null
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
      <div className="container flex items-center gap-4 h-20 px-4">
        {/* Track info */}
        <div className="flex-shrink-0 w-48">
          <p className="font-medium truncate">{loop.title}</p>
          <p className="text-sm text-muted-foreground">
            {loop.bpm} BPM · {loop.key}
          </p>
        </div>

        {/* Player controls */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => toggle(loop.id, loop.preview_url)}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xl flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatDuration(Math.floor(currentTime))}
            </span>
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={([value]) => {
                const time = (value / 100) * duration
                seek(time)
              }}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatDuration(Math.floor(duration))}
            </span>
          </div>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2 w-32">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
          >
            {volume > 0 ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={([value]) => setVolume(value / 100)}
            className="w-20"
          />
        </div>

        {/* Close button */}
        <Button size="icon" variant="ghost" onClick={stop}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
