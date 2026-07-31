import { db } from '../db/database'
import type {
  Story,
  WardrobeItem,
  CreateStoryInput,
  CreateWardrobeItemInput,
  UpdateStoryInput,
  UpdateWardrobeItemInput,
  StoryStats,
  OverallStats,
  WardrobeCategory,
} from '../types/wardrobe'

/**
 * Сервис для работы с гардеробом
 * Содержит бизнес-логику и операции с базой данных
 */
export const wardrobeService = {
  // ─── ИСТОРИИ ────────────────────────────────

  /** Получить все истории */
  async getAllStories(): Promise<Story[]> {
    return db.getAllStories()
  },

  /** Получить историю по ID */
  async getStoryById(id: string): Promise<Story | undefined> {
    return db.getStoryById(id)
  },

  /** Создать новую историю */
  async createStory(input: CreateStoryInput): Promise<Story> {
    const id = await db.addStory(input)
    const story = await db.getStoryById(id)
    return story!
  },

  /** Обновить историю */
  async updateStory(id: string, input: UpdateStoryInput): Promise<void> {
    await db.updateStory(id, input)
  },

  /** Удалить историю и все её предметы */
  async deleteStory(id: string): Promise<void> {
    await db.deleteStory(id)
  },

  // ─── ПРЕДМЕТЫ ГАРДЕРОБА ────────────────────

  /** Получить все предметы истории */
  async getItemsByStory(storyId: string): Promise<WardrobeItem[]> {
    return db.getItemsByStory(storyId)
  },

  /** Получить предметы по категории */
  async getItemsByCategory(storyId: string, category: WardrobeCategory): Promise<WardrobeItem[]> {
    return db.getItemsByCategory(storyId, category)
  },

  /** Добавить новый предмет */
  async createItem(input: CreateWardrobeItemInput): Promise<WardrobeItem> {
    const id = await db.addItem(input)
    const items = await db.getItemsByStory(input.storyId)
    return items.find(i => i.id === id)!
  },

  /** Обновить предмет */
  async updateItem(id: string, input: UpdateWardrobeItemInput): Promise<void> {
    await db.updateItem(id, input)
  },

  /** Удалить предмет */
  async deleteItem(id: string): Promise<void> {
    await db.deleteItem(id)
  },

  /** Переключить статус "У меня есть" */
  async toggleOwned(id: string): Promise<void> {
    const items = await db.items.get(id)
    if (items) {
      await db.updateItem(id, { isOwned: !items.isOwned })
    }
  },

  /** Переключить статус "Хочу получить" */
  async toggleWishlist(id: string): Promise<void> {
    const items = await db.items.get(id)
    if (items) {
      await db.updateItem(id, { isWishlist: !items.isWishlist })
    }
  },

  /** Отметить все наряды в серии как полученные */
  async markSeriesAsOwned(storyId: string, season: number, episode: number): Promise<void> {
    await db.markSeriesAsOwned(storyId, season, episode)
  },

  // ─── СТАТИСТИКА ─────────────────────────────

  /** Получить статистику по конкретной истории */
  async getStoryStats(storyId: string): Promise<StoryStats | null> {
    const story = await db.getStoryById(storyId)
    if (!story) return null

    const items = await db.getItemsByStory(storyId)
    const ownedItems = items.filter(i => i.isOwned)
    const totalItems = items.length
    const percentage = totalItems > 0 ? Math.round((ownedItems.length / totalItems) * 100) : 0

    // Статистика по категориям
    const categories: WardrobeCategory[] = ['dress', 'hairstyle', 'accessory', 'makeup']
    const byCategory = {} as StoryStats['byCategory']

    for (const cat of categories) {
      const catItems = items.filter(i => i.category === cat)
      const catOwned = catItems.filter(i => i.isOwned)
      byCategory[cat] = {
        total: catItems.length,
        owned: catOwned.length,
        percentage: catItems.length > 0 ? Math.round((catOwned.length / catItems.length) * 100) : 0,
      }
    }

    // Подсчёт потраченных алмазов
    const totalDiamondsSpent = ownedItems
      .filter(i => !i.isFree)
      .reduce((sum, i) => sum + i.diamondCost, 0)

    return {
      storyId,
      storyTitle: story.title,
      totalItems,
      ownedItems: ownedItems.length,
      percentage,
      byCategory,
      totalDiamondsSpent,
    }
  },

  /** Получить общую статистику по всем историям */
  async getOverallStats(): Promise<OverallStats> {
    const stories = await db.getAllStories()
    const allItems = await db.items.toArray()
    const ownedItems = allItems.filter(i => i.isOwned)

    const totalItems = allItems.length
    const overallPercentage = totalItems > 0
      ? Math.round((ownedItems.length / totalItems) * 100)
      : 0

    const totalDiamondsSpent = ownedItems
      .filter(i => !i.isFree)
      .reduce((sum, i) => sum + i.diamondCost, 0)

    const wishlistItems = allItems.filter(i => i.isWishlist).length
    const completedStories = stories.filter(s => s.status === 'completed').length

    // Разбивка по историям
    const storiesBreakdown = await Promise.all(
      stories.map(async (story) => {
        const storyItems = allItems.filter(i => i.storyId === story.id)
        const storyOwned = storyItems.filter(i => i.isOwned)
        return {
          storyId: story.id,
          storyTitle: story.title,
          percentage: storyItems.length > 0
            ? Math.round((storyOwned.length / storyItems.length) * 100)
            : 0,
          ownedItems: storyOwned.length,
          totalItems: storyItems.length,
        }
      })
    )

    return {
      totalStories: stories.length,
      completedStories,
      totalItems,
      ownedItems: ownedItems.length,
      overallPercentage,
      totalDiamondsSpent,
      wishlistItems,
      storiesBreakdown,
    }
  },

  // ─── ИМПОРТ / ЭКСПОРТ ──────────────────────

  /** Экспортировать все данные */
  async exportData(): Promise<string> {
    return db.exportAllData()
  },

  /** Импортировать данные */
  async importData(jsonData: string): Promise<void> {
    await db.importAllData(jsonData)
  },
}