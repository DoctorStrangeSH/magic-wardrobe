import Dexie, { Table } from 'dexie'
import type { Story, WardrobeItem } from '../types/wardrobe'

/**
 * База данных Magic Wardrobe
 * Использует IndexedDB через Dexie.js для локального хранения
 * всех данных гардероба
 */
class WardrobeDatabase extends Dexie {
  // Таблицы базы данных
  stories!: Table<Story, string>
  items!: Table<WardrobeItem, string>

  constructor() {
    super('MagicWardrobeDB')

    // Версия 1: начальная структура
    this.version(1).stores({
      // Первичный ключ — id, индексы для быстрого поиска
      stories: 'id, title, status, createdAt',
      items: 'id, storyId, category, isOwned, isWishlist, [storyId+category], [storyId+isOwned]',
    })

    // Хуки для автоматического обновления updatedAt
    this.stories.hook('creating', (_primKey, obj) => {
      const now = new Date()
      obj.createdAt = now
      obj.updatedAt = now
      return obj
    })

    this.stories.hook('updating', (modifications, _primKey, _obj) => {
      ;(modifications as Record<string, unknown>).updatedAt = new Date()
      return modifications
    })

    this.items.hook('creating', (_primKey, obj) => {
      const now = new Date()
      obj.createdAt = now
      obj.updatedAt = now
      return obj
    })

    this.items.hook('updating', (modifications, _primKey, _obj) => {
      ;(modifications as Record<string, unknown>).updatedAt = new Date()
      return modifications
    })
  }

  /** Получить все истории, отсортированные по дате создания */
  async getAllStories(): Promise<Story[]> {
    return this.stories.orderBy('createdAt').reverse().toArray()
  }

  /** Получить историю по ID */
  async getStoryById(id: string): Promise<Story | undefined> {
    return this.stories.get(id)
  }

  /** Добавить новую историю */
  async addStory(story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID()
    const now = new Date()
    await this.stories.add({
      ...story,
      id,
      createdAt: now,
      updatedAt: now,
    } as Story)
    return id
  }

  /** Обновить историю */
  async updateStory(id: string, updates: Partial<Story>): Promise<void> {
    await this.stories.update(id, { ...updates, updatedAt: new Date() } as Partial<Story>)
  }

  /** Удалить историю и все её предметы */
  async deleteStory(id: string): Promise<void> {
    await this.transaction('rw', this.stories, this.items, async () => {
      await this.stories.delete(id)
      await this.items.where('storyId').equals(id).delete()
    })
  }

  /** Получить все предметы для истории */
  async getItemsByStory(storyId: string): Promise<WardrobeItem[]> {
    return this.items.where('storyId').equals(storyId).toArray()
  }

  /** Получить предметы по категории в истории */
  async getItemsByCategory(storyId: string, category: string): Promise<WardrobeItem[]> {
    return this.items.where('[storyId+category]').equals([storyId, category]).toArray()
  }

  /** Получить предметы по статусу владения */
  async getItemsByOwnership(storyId: string, isOwned: boolean): Promise<WardrobeItem[]> {
    const ownedValue = isOwned ? 1 : 0
    return this.items
      .where('storyId').equals(storyId)
      .filter(item => item.isOwned === isOwned)
      .toArray()
  }

  /** Добавить новый предмет */
  async addItem(item: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID()
    const now = new Date()
    await this.items.add({
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    } as WardrobeItem)
    return id
  }

  /** Обновить предмет */
  async updateItem(id: string, updates: Partial<WardrobeItem>): Promise<void> {
    await this.items.update(id, { ...updates, updatedAt: new Date() } as Partial<WardrobeItem>)
  }

  /** Удалить предмет */
  async deleteItem(id: string): Promise<void> {
    await this.items.delete(id)
  }

  /** Массово отметить предметы в серии как полученные */
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

  /** Экспортировать все данные в JSON */
  async exportAllData(): Promise<string> {
    const stories = await this.stories.toArray()
    const items = await this.items.toArray()
    return JSON.stringify(
      { stories, items, exportDate: new Date().toISOString() },
      null,
      2
    )
  }

  /** Импортировать данные из JSON */
  async importAllData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData)

    await this.transaction('rw', this.stories, this.items, async () => {
      // Очищаем текущие данные
      await this.stories.clear()
      await this.items.clear()

      // Добавляем новые
      if (data.stories && Array.isArray(data.stories)) {
        await this.stories.bulkAdd(data.stories)
      }
      if (data.items && Array.isArray(data.items)) {
        await this.items.bulkAdd(data.items)
      }
    })
  }

  /** Получить общее количество предметов */
  async getTotalItemsCount(): Promise<number> {
    return this.items.count()
  }

  /** Получить количество предметов, которые есть у пользователя */
  async getOwnedItemsCount(): Promise<number> {
    return this.items.where('isOwned').equals(1).count()
  }
}

// Создаём и экспортируем единственный экземпляр базы данных
export const db = new WardrobeDatabase()