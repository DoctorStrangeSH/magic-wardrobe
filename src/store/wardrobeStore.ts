import { create } from 'zustand'
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
} from '../core/types/wardrobe'
import { wardrobeService } from '../core/services/wardrobeService'

/**
 * Состояние хранилища гардероба
 */
interface WardrobeState {
  // ─── ДАННЫЕ ─────────────────────────────────
  stories: Story[]
  selectedStoryId: string | null
  currentItems: WardrobeItem[]
  storyStats: StoryStats | null
  overallStats: OverallStats | null

  // ─── UI СОСТОЯНИЕ ───────────────────────────
  isLoading: boolean
  error: string | null
  activeCategory: WardrobeCategory | 'all'
  showOnlyOwned: boolean
  showOnlyWishlist: boolean
  searchQuery: string

  // ─── ДЕЙСТВИЯ: ИСТОРИИ ──────────────────────
  loadStories: () => Promise<void>
  selectStory: (storyId: string | null) => void
  createStory: (input: CreateStoryInput) => Promise<Story>
  updateStory: (id: string, input: UpdateStoryInput) => Promise<void>
  deleteStory: (id: string) => Promise<void>
  refreshStories: () => Promise<void>

  // ─── ДЕЙСТВИЯ: ПРЕДМЕТЫ ─────────────────────
  loadItems: (storyId: string) => Promise<void>
  createItem: (input: CreateWardrobeItemInput) => Promise<WardrobeItem>
  updateItem: (id: string, input: UpdateWardrobeItemInput) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  toggleOwned: (id: string) => Promise<void>
  toggleWishlist: (id: string) => Promise<void>
  markSeriesAsOwned: (storyId: string, season: number, episode: number) => Promise<void>
  refreshItems: () => Promise<void>

  // ─── ДЕЙСТВИЯ: СТАТИСТИКА ───────────────────
  loadOverallStats: () => Promise<void>
  loadStoryStats: (storyId: string) => Promise<void>

  // ─── ДЕЙСТВИЯ: ФИЛЬТРЫ ──────────────────────
  setActiveCategory: (category: WardrobeCategory | 'all') => void
  setShowOnlyOwned: (show: boolean) => void
  setShowOnlyWishlist: (show: boolean) => void
  setSearchQuery: (query: string) => void

  // ─── ДЕЙСТВИЯ: ИМПОРТ/ЭКСПОРТ ───────────────
  exportData: () => Promise<string>
  importData: (jsonData: string) => Promise<void>

  // ─── ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ ──────────────────
  getFilteredItems: () => WardrobeItem[]
}

/**
 * Хранилище Zustand для управления гардеробом
 */
export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  // ─── НАЧАЛЬНОЕ СОСТОЯНИЕ ────────────────────
  stories: [],
  selectedStoryId: null,
  currentItems: [],
  storyStats: null,
  overallStats: null,
  isLoading: false,
  error: null,
  activeCategory: 'all',
  showOnlyOwned: false,
  showOnlyWishlist: false,
  searchQuery: '',

  // ─── ДЕЙСТВИЯ: ИСТОРИИ ──────────────────────

  /** Загрузить все истории */
  loadStories: async () => {
    set({ isLoading: true, error: null })
    try {
      const stories = await wardrobeService.getAllStories()
      set({ stories, isLoading: false })
    } catch (error) {
      set({ error: 'Ошибка загрузки историй', isLoading: false })
      console.error('Ошибка загрузки историй:', error)
    }
  },

  /** Выбрать историю */
  selectStory: (storyId: string | null) => {
    set({ selectedStoryId: storyId, activeCategory: 'all', showOnlyOwned: false, searchQuery: '' })
    if (storyId) {
      get().loadItems(storyId)
      get().loadStoryStats(storyId)
    } else {
      set({ currentItems: [], storyStats: null })
    }
  },

  /** Создать историю */
  createStory: async (input: CreateStoryInput) => {
    const story = await wardrobeService.createStory(input)
    await get().loadStories()
    await get().loadOverallStats()
    return story
  },

  /** Обновить историю */
  updateStory: async (id: string, input: UpdateStoryInput) => {
    await wardrobeService.updateStory(id, input)
    await get().loadStories()
    if (get().selectedStoryId === id) {
      await get().loadStoryStats(id)
    }
    await get().loadOverallStats()
  },

  /** Удалить историю */
  deleteStory: async (id: string) => {
    await wardrobeService.deleteStory(id)
    if (get().selectedStoryId === id) {
      set({ selectedStoryId: null, currentItems: [], storyStats: null })
    }
    await get().loadStories()
    await get().loadOverallStats()
  },

  /** Обновить список историй */
  refreshStories: async () => {
    await get().loadStories()
    await get().loadOverallStats()
  },

  // ─── ДЕЙСТВИЯ: ПРЕДМЕТЫ ─────────────────────

  /** Загрузить предметы истории */
  loadItems: async (storyId: string) => {
    set({ isLoading: true, error: null })
    try {
      const items = await wardrobeService.getItemsByStory(storyId)
      set({ currentItems: items, isLoading: false })
    } catch (error) {
      set({ error: 'Ошибка загрузки предметов', isLoading: false })
      console.error('Ошибка загрузки предметов:', error)
    }
  },

  /** Создать предмет */
  createItem: async (input: CreateWardrobeItemInput) => {
    const item = await wardrobeService.createItem(input)
    await get().refreshItems()
    return item
  },

  /** Обновить предмет */
  updateItem: async (id: string, input: UpdateWardrobeItemInput) => {
    await wardrobeService.updateItem(id, input)
    await get().refreshItems()
  },

  /** Удалить предмет */
  deleteItem: async (id: string) => {
    await wardrobeService.deleteItem(id)
    await get().refreshItems()
  },

  /** Переключить статус владения */
  toggleOwned: async (id: string) => {
    await wardrobeService.toggleOwned(id)
    await get().refreshItems()
  },

  /** Переключить статус избранного */
  toggleWishlist: async (id: string) => {
    await wardrobeService.toggleWishlist(id)
    await get().refreshItems()
  },

  /** Отметить серию как полученную */
  markSeriesAsOwned: async (storyId: string, season: number, episode: number) => {
    await wardrobeService.markSeriesAsOwned(storyId, season, episode)
    await get().refreshItems()
  },

  /** Обновить предметы и статистику */
  refreshItems: async () => {
    const { selectedStoryId } = get()
    if (selectedStoryId) {
      await get().loadItems(selectedStoryId)
      await get().loadStoryStats(selectedStoryId)
    }
    await get().loadOverallStats()
  },

  // ─── ДЕЙСТВИЯ: СТАТИСТИКА ───────────────────

  /** Загрузить общую статистику */
  loadOverallStats: async () => {
    try {
      const stats = await wardrobeService.getOverallStats()
      set({ overallStats: stats })
    } catch (error) {
      console.error('Ошибка загрузки общей статистики:', error)
    }
  },

  /** Загрузить статистику истории */
  loadStoryStats: async (storyId: string) => {
    try {
      const stats = await wardrobeService.getStoryStats(storyId)
      set({ storyStats: stats })
    } catch (error) {
      console.error('Ошибка загрузки статистики истории:', error)
    }
  },

  // ─── ДЕЙСТВИЯ: ФИЛЬТРЫ ──────────────────────

  setActiveCategory: (category: WardrobeCategory | 'all') => {
    set({ activeCategory: category })
  },

  setShowOnlyOwned: (show: boolean) => {
    set({ showOnlyOwned: show })
    if (show) {
      set({ showOnlyWishlist: false })
    }
  },

  setShowOnlyWishlist: (show: boolean) => {
    set({ showOnlyWishlist: show })
    if (show) {
      set({ showOnlyOwned: false })
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  // ─── ДЕЙСТВИЯ: ИМПОРТ/ЭКСПОРТ ───────────────

  exportData: async () => {
    return wardrobeService.exportData()
  },

  importData: async (jsonData: string) => {
    await wardrobeService.importData(jsonData)
    await get().loadStories()
    await get().loadOverallStats()
    set({ selectedStoryId: null, currentItems: [], storyStats: null })
  },

  // ─── ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ ──────────────────

  /** Получить отфильтрованные предметы */
  getFilteredItems: () => {
    const { currentItems, activeCategory, showOnlyOwned, showOnlyWishlist, searchQuery } = get()
    
    let filtered = [...currentItems]

    // Фильтр по категории
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory)
    }

    // Фильтр "только имеющиеся"
    if (showOnlyOwned) {
      filtered = filtered.filter(item => item.isOwned)
    }

    // Фильтр "хочу получить"
    if (showOnlyWishlist) {
      filtered = filtered.filter(item => item.isWishlist)
    }

    // Поиск по названию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query)
      )
    }

    return filtered
  },
}))