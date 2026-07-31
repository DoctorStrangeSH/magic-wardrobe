import { useEffect, useState } from 'react'
import { wardrobeService } from '../core/services/wardrobeService'
import type { OverallStats, StoryStats } from '../core/types/wardrobe'

/**
 * Хук для загрузки общей статистики
 */
export function useOverallStats() {
  const [stats, setStats] = useState<OverallStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await wardrobeService.getOverallStats()
      setStats(data)
    } catch (err) {
      setError('Ошибка загрузки статистики')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return { stats, isLoading, error, refresh: loadStats }
}

/**
 * Хук для загрузки статистики конкретной истории
 */
export function useStoryStats(storyId: string | null) {
  const [stats, setStats] = useState<StoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    if (!storyId) {
      setStats(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await wardrobeService.getStoryStats(storyId)
      setStats(data)
    } catch (err) {
      setError('Ошибка загрузки статистики истории')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [storyId])

  return { stats, isLoading, error, refresh: loadStats }
}