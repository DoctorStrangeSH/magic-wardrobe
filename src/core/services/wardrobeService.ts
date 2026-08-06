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
  CostType,
} from '../types/wardrobe'

export const wardrobeService = {
  // Истории
  async getAllStories(): Promise<Story[]> { return db.getAllStories() },
  async getStoryById(id: string): Promise<Story | undefined> { return db.getStoryById(id) },
  async createStory(input: CreateStoryInput): Promise<Story> {
    const id = await db.addStory(input)
    return (await db.getStoryById(id))!
  },
  async updateStory(id: string, input: UpdateStoryInput): Promise<void> { await db.updateStory(id, input) },
  async deleteStory(id: string): Promise<void> { await db.deleteStory(id) },

  // Предметы
  async getItemsByStory(storyId: string): Promise<WardrobeItem[]> { return db.getItemsByStory(storyId) },
  async getItemsByCategory(storyId: string, category: WardrobeCategory): Promise<WardrobeItem[]> {
    return db.getItemsByCategory(storyId, category)
  },
  async createItem(input: CreateWardrobeItemInput): Promise<WardrobeItem> {
    const id = await db.addItem(input)
    const items = await db.getItemsByStory(input.storyId)
    return items.find(i => i.id === id)!
  },
  async updateItem(id: string, input: UpdateWardrobeItemInput): Promise<void> { await db.updateItem(id, input) },
  async deleteItem(id: string): Promise<void> { await db.deleteItem(id) },
  async toggleOwned(id: string): Promise<void> {
    const item = await db.items.get(id)
    if (item) await db.updateItem(id, { isOwned: !item.isOwned })
  },
  async toggleWishlist(id: string): Promise<void> {
    const item = await db.items.get(id)
    if (item) await db.updateItem(id, { isWishlist: !item.isWishlist })
  },
  async markSeriesAsOwned(storyId: string, season: number, episode: number): Promise<void> {
    await db.markSeriesAsOwned(storyId, season, episode)
  },

  // Статистика по истории
  async getStoryStats(storyId: string): Promise<StoryStats | null> {
    const story = await db.getStoryById(storyId)
    if (!story) return null

    const items = await db.getItemsByStory(storyId)
    const ownedItems = items.filter(i => i.isOwned)
    const totalItems = items.length
    const percentage = totalItems > 0 ? Math.round((ownedItems.length / totalItems) * 100) : 0

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

    const totalDiamondsSpent = ownedItems
      .filter(i => i.costType === 'diamond')
      .reduce((sum, i) => sum + i.diamondCost, 0)

    const totalStatsSpent = ownedItems
      .filter(i => i.costType === 'stats')
      .reduce((sum, i) => sum + i.statCost, 0)

    return {
      storyId, storyTitle: story.title, totalItems, ownedItems: ownedItems.length,
      percentage, byCategory, totalDiamondsSpent, totalStatsSpent,
    }
  },

  // Общая статистика
  async getOverallStats(): Promise<OverallStats> {
    const stories = await db.getAllStories()
    const allItems = await db.items.toArray()
    const ownedItems = allItems.filter(i => i.isOwned)

    const totalItems = allItems.length
    const overallPercentage = totalItems > 0 ? Math.round((ownedItems.length / totalItems) * 100) : 0

    const totalDiamondsSpent = ownedItems
      .filter(i => i.costType === 'diamond')
      .reduce((sum, i) => sum + i.diamondCost, 0)

    const totalStatsSpent = ownedItems
      .filter(i => i.costType === 'stats')
      .reduce((sum, i) => sum + i.statCost, 0)

    const wishlistItems = allItems.filter(i => i.isWishlist).length
    const completedStories = stories.filter(s => s.status === 'completed').length

    const storiesBreakdown = await Promise.all(stories.map(async (story) => {
      const storyItems = allItems.filter(i => i.storyId === story.id)
      const storyOwned = storyItems.filter(i => i.isOwned)
      return {
        storyId: story.id, storyTitle: story.title,
        percentage: storyItems.length > 0 ? Math.round((storyOwned.length / storyItems.length) * 100) : 0,
        ownedItems: storyOwned.length, totalItems: storyItems.length,
      }
    }))

    return {
      totalStories: stories.length, completedStories, totalItems,
      ownedItems: ownedItems.length, overallPercentage,
      totalDiamondsSpent, totalStatsSpent, wishlistItems, storiesBreakdown,
    }
  },

  // Импорт/экспорт
  async exportData(): Promise<string> { return db.exportAllData() },
  async importData(jsonData: string): Promise<void> { await db.importAllData(jsonData) },
}