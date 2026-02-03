'use client'

import { useState, useRef, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'

interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  currentLoopId: string | null
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    currentLoopId: null,
  })

  useEffect(() => {
    const audio = new Audio()
    audio.volume = state.volume
    audioRef.current = audio

    const handleTimeUpdate = () => {
      setState((prev) => ({ ...prev, currentTime: audio.currentTime }))
    }

    const handleLoadedMetadata = () => {
      setState((prev) => ({ ...prev, duration: audio.duration }))
    }

    const handleEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }))
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const play = useCallback((loopId: string, previewUrl: string) => {
    const audio = audioRef.current
    if (!audio) return

    // If different loop, load new source
    if (state.currentLoopId !== loopId) {
      audio.src = previewUrl
      audio.load()
      setState((prev) => ({
        ...prev,
        currentLoopId: loopId,
        currentTime: 0,
        duration: 0,
      }))
    }

    audio.play()
    setState((prev) => ({ ...prev, isPlaying: true }))
  }, [state.currentLoopId])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    setState((prev) => ({ ...prev, isPlaying: false }))
  }, [])

  const toggle = useCallback((loopId: string, previewUrl: string) => {
    if (state.currentLoopId === loopId && state.isPlaying) {
      pause()
    } else {
      play(loopId, previewUrl)
    }
  }, [state.currentLoopId, state.isPlaying, play, pause])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = time
    setState((prev) => ({ ...prev, currentTime: time }))
  }, [])

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
    setState((prev) => ({ ...prev, volume }))
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      currentLoopId: null,
    }))
  }, [])

  return {
    ...state,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    stop,
  }
}

// Global audio player context
type AudioPlayerContextType = ReturnType<typeof useAudioPlayer>

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null)

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer()

  return (
    <AudioPlayerContext.Provider value={player}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useGlobalAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useGlobalAudioPlayer must be used within AudioPlayerProvider')
  }
  return context
}
