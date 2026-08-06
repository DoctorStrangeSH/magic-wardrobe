import Dexie, { Table } from 'dexie'
import type { Story, WardrobeItem } from '../types/wardrobe'

/**
 * База данных Magic Wardrobe (IndexedDB)
 * Используется как локальный кеш и для оффлайн-режима
 * Основные данные хранятся в Supabase
 */
class WardrobeDatabase extends Dexie {
  stories!: Table<Story, string>
  items!: Table<WardrobeItem, string>

  constructor() {
    super('MagicWardrobeDB')

    this.version(3).stores({
      stories: 'id, title, status, created_at',
      items: 'id, story_id, category, cost_type, is_owned, is_wishlist, [story_id+category], [story_id+is_owned]',
    })

    // Хуки для stories
    this.stories.hook('creating', (_primKey, obj) => {
      const now = new Date().toISOString()
      if (!obj.created_at) obj.created_at = now
      if (!obj.updated_at) obj.updated_at = now
      return obj
    })

    this.stories.hook('updating', (modifications) => {
      ;(modifications as Record<string, unknown>).updated_at = new Date().toISOString()
      return modifications
    })

    // Хуки для items
    this.items.hook('creating', (_primKey, obj) => {
      const now = new Date().toISOString()
      if (!obj.created_at) obj.created_at = now
      if (!obj.updated_at) obj.updated_at = now
      if (!obj.cost_type) obj.cost_type = 'free'
      if (!obj.stat_name) obj.stat_name = ''
      if (!obj.stat_cost) obj.stat_cost = 0
      if (obj.is_owned === undefined) obj.is_owned = false
      return obj
    })

    this.items.hook('updating', (modifications) => {
      ;(modifications as Record<string, unknown>).updated_at = new Date().toISOString()
      return modifications
    })
  }

  async getAllStories(): Promise<Story[]> {
    return this.stories.orderBy('created_at').reverse().toArray()
  }

  async getStoryById(id: string): Promise<Story | undefined> {
    return this.stories.get(id)
  }

  async addStory(story: Omit<Story, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.stories.add({ ...story, id, created_at: now, updated_at: now } as Story)
    return id
  }

  async updateStory(id: string, updates: Partial<Story>): Promise<void> {
    await this.stories.update(id, { ...updates, updated_at: new Date().toISOString() } as Partial<Story>)
  }

  async deleteStory(id: string): Promise<void> {
    await this.transaction('rw', this.stories, this.items, async () => {
      await this.stories.delete(id)
      await this.items.where('story_id').equals(id).delete()
    })
  }

  async getItemsByStory(story_id: string): Promise<WardrobeItem[]> {
    return this.items.where('story_id').equals(story_id).toArray()
  }

  async getItemsByCategory(story_id: string, category: string): Promise<WardrobeItem[]> {
    return this.items.where('[story_id+category]').equals([story_id, category]).toArray()
  }

  async addItem(item: Omit<WardrobeItem, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.items.add({ ...item, id, created_at: now, updated_at: now } as WardrobeItem)
    return id
  }

  async updateItem(id: string, updates: Partial<WardrobeItem>): Promise<void> {
    await this.items.update(id, { ...updates, updated_at: new Date().toISOString() } as Partial<WardrobeItem>)
  }

  async deleteItem(id: string): Promise<void> {
    await this.items.delete(id)
  }

  async markSeriesAsOwned(story_id: string, season: number, episode: number): Promise<void> {
    const items = await this.items
      .where('story_id').equals(story_id)
      .filter(item => item.season === season && item.episode === episode && !item.is_owned)
      .toArray()

    await this.transaction('rw', this.items, async () => {
      for (const item of items) {
        await this.items.update(item.id, { is_owned: true } as Partial<WardrobeItem>)
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

      if (data.stories?.length > 0) {
        await this.stories.bulkAdd(data.stories)
      }

      if (data.items?.length > 0) {
        await this.items.bulkAdd(data.items)
      }
    })
  }

  async getTotalItemsCount(): Promise<number> {
    return this.items.count()
  }

  async getOwnedItemsCount(): Promise<number> {
    return this.items.where('is_owned').equals(1).count()
  }
}

export const db = new WardrobeDatabase()