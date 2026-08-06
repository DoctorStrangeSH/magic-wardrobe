import Dexie, { Table } from 'dexie'
import type { Story, WardrobeItem } from '../types/wardrobe'

class WardrobeDatabase extends Dexie {
  stories!: Table<Story, string>
  items!: Table<WardrobeItem, string>

  constructor() {
    super('MagicWardrobeDB')

    // Версия 1: начальная структура
    this.version(1).stores({
      stories: 'id, title, status, createdAt',
      items: 'id, storyId, category, isOwned, isWishlist, [storyId+category], [storyId+isOwned]',
    })

    // Версия 2: добавляем costType, statName, statCost
    this.version(2).stores({
      stories: 'id, title, status, createdAt',
      items: 'id, storyId, category, costType, isOwned, isWishlist, [storyId+category], [storyId+isOwned]',
    }).upgrade(tx => {
      return tx.table('items').toCollection().modify(item => {
        // Миграция старых данных: добавляем новые поля
        if (!item.costType) {
          item.costType = item.isFree ? 'free' : 'diamond'
        }
        if (!item.statName) item.statName = ''
        if (!item.statCost) item.statCost = 0
      })
    })

    // Хуки
    this.stories.hook('creating', (_primKey, obj) => {
      const now = new Date()
      if (!obj.createdAt) obj.createdAt = now
      if (!obj.updatedAt) obj.updatedAt = now
      return obj
    })

    this.stories.hook('updating', (modifications, _primKey, _obj) => {
      ;(modifications as Record<string, unknown>).updatedAt = new Date()
      return modifications
    })

    this.items.hook('creating', (_primKey, obj) => {
      const now = new Date()
      if (!obj.createdAt) obj.createdAt = now
      if (!obj.updatedAt) obj.updatedAt = now
      if (!obj.costType) obj.costType = 'free'
      if (!obj.statName) obj.statName = ''
      if (!obj.statCost) obj.statCost = 0
      return obj
    })

    this.items.hook('updating', (modifications, _primKey, _obj) => {
      ;(modifications as Record<string, unknown>).updatedAt = new Date()
      return modifications
    })
  }

  async getAllStories(): Promise<Story[]> {
    return this.stories.orderBy('createdAt').reverse().toArray()
  }

  async getStoryById(id: string): Promise<Story | undefined> {
    return this.stories.get(id)
  }

  async addStory(story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID()
    const now = new Date()
    await this.stories.add({ ...story, id, createdAt: now, updatedAt: now } as Story)
    return id
  }

  async updateStory(id: string, updates: Partial<Story>): Promise<void> {
    await this.stories.update(id, { ...updates, updatedAt: new Date() } as Partial<Story>)
  }

  async deleteStory(id: string): Promise<void> {
    await this.transaction('rw', this.stories, this.items, async () => {
      await this.stories.delete(id)
      await this.items.where('storyId').equals(id).delete()
    })
  }

  async getItemsByStory(storyId: string): Promise<WardrobeItem[]> {
    return this.items.where('storyId').equals(storyId).toArray()
  }

  async getItemsByCategory(storyId: string, category: string): Promise<WardrobeItem[]> {
    return this.items.where('[storyId+category]').equals([storyId, category]).toArray()
  }

  async addItem(item: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID()
    const now = new Date()
    await this.items.add({ ...item, id, createdAt: now, updatedAt: now } as WardrobeItem)
    return id
  }

  async updateItem(id: string, updates: Partial<WardrobeItem>): Promise<void> {
    await this.items.update(id, { ...updates, updatedAt: new Date() } as Partial<WardrobeItem>)
  }

  async deleteItem(id: string): Promise<void> {
    await this.items.delete(id)
  }

  async markSeriesAsOwned(storyId: string, season: number, episode: number): Promise<void> {
    const items = await this.items
      .where('storyId').equals(storyId)
      .filter(item => item.season === season && item.episode === episode && !item.isOwned)
      .toArray()
    await this.transaction('rw', this.items, async () => {
      for (const item of items) {
        await this.items.update(item.id, { isOwned: true } as Partial<WardrobeItem>)
      }
    })
  }

  async exportAllData(): Promise<string> {
    const stories = await this.stories.toArray()
    const items = await this.items.toArray()
    return JSON.stringify({ stories, items, exportDate: new Date().toISOString() }, null, 2)
  }

  async importAllData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData)
    await this.transaction('rw', this.stories, this.items, async () => {
      await this.stories.clear()
      await this.items.clear()
      if (data.stories && Array.isArray(data.stories)) {
        await this.stories.bulkAdd(data.stories)
      }
      if (data.items && Array.isArray(data.items)) {
        await this.items.bulkAdd(data.items)
      }
    })
  }

  async getTotalItemsCount(): Promise<number> {
    return this.items.count()
  }

  async getOwnedItemsCount(): Promise<number> {
    return this.items.where('isOwned').equals(1).count()
  }
}

export const db = new WardrobeDatabase()