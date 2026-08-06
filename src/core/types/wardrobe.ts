export type StoryStatus = 'playing' | 'completed' | 'paused'
export type WardrobeCategory = 'dress' | 'hairstyle' | 'accessory' | 'makeup'
export type CostType = 'free' | 'diamond' | 'stats'

export interface Story {
  id: string
  title: string
  cover: string | null
  total_seasons: number
  status: StoryStatus
  current_season: number
  current_episode: number
  notes: string
  created_at: string
  updated_at: string
}

export interface WardrobeItem {
  id: string
  story_id: string
  category: WardrobeCategory
  name: string
  image: string | null
  season: number
  episode: number
  cost_type: CostType
  diamond_cost: number
  stat_name: string
  stat_cost: number
  is_owned: boolean
  is_wishlist: boolean
  notes: string
  created_at: string
  updated_at: string
}

export type CreateStoryInput = Omit<Story, 'id' | 'created_at' | 'updated_at'>
export type CreateWardrobeItemInput = Omit<WardrobeItem, 'id' | 'created_at' | 'updated_at'>
export type UpdateStoryInput = Partial<CreateStoryInput>
export type UpdateWardrobeItemInput = Partial<CreateWardrobeItemInput>

export interface StoryStats {
  storyId: string
  storyTitle: string
  totalItems: number
  ownedItems: number
  percentage: number
  byCategory: Record<WardrobeCategory, { total: number; owned: number; percentage: number }>
  totalDiamondsSpent: number
  totalStatsSpent: number
}

export interface OverallStats {
  totalStories: number
  completedStories: number
  totalItems: number
  ownedItems: number
  overallPercentage: number
  totalDiamondsSpent: number
  totalStatsSpent: number
  wishlistItems: number
  storiesBreakdown: Array<{
    storyId: string
    storyTitle: string
    percentage: number
    ownedItems: number
    totalItems: number
  }>
}

export const CATEGORY_LABELS: Record<WardrobeCategory, string> = {
  dress: 'Платья и костюмы', hairstyle: 'Причёски', accessory: 'Аксессуары', makeup: 'Макияж',
}

export const CATEGORY_ICONS: Record<WardrobeCategory, string> = {
  dress: '👗', hairstyle: '💇‍♀️', accessory: '💍', makeup: '💄',
}

export const COST_TYPE_LABELS: Record<CostType, string> = {
  free: 'Бесплатно', diamond: 'За алмазы', stats: 'За статы',
}