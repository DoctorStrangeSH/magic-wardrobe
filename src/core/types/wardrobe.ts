export type StoryStatus = 'playing' | 'completed' | 'paused'
export type WardrobeCategory = 'dress' | 'hairstyle' | 'accessory' | 'makeup'

export interface Story {
  id: string
  title: string
  cover: string | null
  totalSeasons: number
  status: StoryStatus
  currentSeason: number
  currentEpisode: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface WardrobeItem {
  id: string
  storyId: string
  category: WardrobeCategory
  name: string
  image: string | null
  season: number
  episode: number
  isFree: boolean
  diamondCost: number
  isOwned: boolean
  isWishlist: boolean
  notes: string
  createdAt: Date
  updatedAt: Date
}

export type CreateStoryInput = Omit<Story, 'id' | 'createdAt' | 'updatedAt'>
export type CreateWardrobeItemInput = Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateStoryInput = Partial<Omit<Story, 'id' | 'createdAt' | 'updatedAt'>>
export type UpdateWardrobeItemInput = Partial<Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>>

export interface StoryStats {
  storyId: string
  storyTitle: string
  totalItems: number
  ownedItems: number
  percentage: number
  byCategory: Record<WardrobeCategory, {
    total: number
    owned: number
    percentage: number
  }>
  totalDiamondsSpent: number
}

export interface OverallStats {
  totalStories: number
  completedStories: number
  totalItems: number
  ownedItems: number
  overallPercentage: number
  totalDiamondsSpent: number
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
  dress: 'Платья и костюмы',
  hairstyle: 'Причёски',
  accessory: 'Аксессуары',
  makeup: 'Макияж',
}

export const CATEGORY_ICONS: Record<WardrobeCategory, string> = {
  dress: '👗',
  hairstyle: '💇‍♀️',
  accessory: '💍',
  makeup: '💄',
}