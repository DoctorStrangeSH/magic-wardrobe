// Типы данных для трекера гардероба "Клуб Романтики"

/** Статус прохождения истории */
export type StoryStatus = 'playing' | 'completed' | 'paused'

/** Категории предметов гардероба */
export type WardrobeCategory = 'dress' | 'hairstyle' | 'accessory' | 'makeup'

/** Интерфейс истории */
export interface Story {
  id: string
  title: string
  cover: string | null // base64 картинка или URL
  totalSeasons: number
  status: StoryStatus
  currentSeason: number
  currentEpisode: number
  notes: string
  createdAt: Date
  updatedAt: Date
}

/** Интерфейс предмета гардероба */
export interface WardrobeItem {
  id: string
  storyId: string // связь с историей
  category: WardrobeCategory
  name: string
  image: string | null // base64 скриншота или URL
  season: number
  episode: number
  isFree: boolean
  diamondCost: number // 0 если бесплатно
  isOwned: boolean // галочка "У меня есть"
  isWishlist: boolean // "Хочу получить"
  notes: string
  createdAt: Date
  updatedAt: Date
}

/** Данные для создания новой истории (без авто-генерируемых полей) */
export type CreateStoryInput = Omit<Story, 'id' | 'createdAt' | 'updatedAt'>

/** Данные для создания нового предмета */
export type CreateWardrobeItemInput = Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>

/** Данные для обновления истории */
export type UpdateStoryInput = Partial<Omit<Story, 'id' | 'createdAt' | 'updatedAt'>>

/** Данные для обновления предмета */
export type UpdateWardrobeItemInput = Partial<Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>>

/** Статистика по истории */
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

/** Общая статистика по всем историям */
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

/** Категории с русскими названиями */
export const CATEGORY_LABELS: Record<WardrobeCategory, string> = {
  dress: 'Платья и костюмы',
  hairstyle: 'Причёски',
  accessory: 'Аксессуары',
  makeup: 'Макияж',
}

/** Иконки для категорий (эмодзи) */
export const CATEGORY_ICONS: Record<WardrobeCategory, string> = {
  dress: '👗',
  hairstyle: '💇‍♀️',
  accessory: '💍',
  makeup: '💄',
}

/** Статусы историй с русскими названиями */
export const STORY_STATUS_LABELS: Record<StoryStatus, string> = {
  playing: 'Прохожу',
  completed: 'Пройдена',
  paused: 'Пауза',
}