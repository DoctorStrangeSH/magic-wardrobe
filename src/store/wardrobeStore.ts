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

type FilterMode = 'all' | 'owned' | 'missing'
type SortMode = 'newest' | 'oldest' | 'name' | 'season'

interface WardrobeState {
  // Данные
  stories: Story[]
  selectedStoryId: string | null
  currentItems: WardrobeItem[]
  storyStats: StoryStats | null
  overallStats: OverallStats | null

  // UI
  isLoading: boolean
  error: string | null
  activeCategory: WardrobeCategory | 'all'
  filterMode: FilterMode
  sortBy: SortMode
  searchQuery: string

  // Действия: истории
  loadStories: () => Promise<void>
  selectStory: (storyId: string | null) => void
  createStory: (input: CreateStoryInput) => Promise<Story>
  updateStory: (id: string, input: UpdateStoryInput) => Promise<void>
  deleteStory: (id: string) => Promise<void>
  refreshStories: () => Promise<void>

  // Действия: предметы
  loadItems: (storyId: string) => Promise<void>
  createItem: (input: CreateWardrobeItemInput) => Promise<WardrobeItem>
  updateItem: (id: string, input: UpdateWardrobeItemInput) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  toggleOwned: (id: string) => Promise<void>
  refreshItems: () => Promise<void>

  // Действия: статистика
  loadOverallStats: () => Promise<void>
  loadStoryStats: (storyId: string) => Promise<void>

  // Действия: фильтры
  setActiveCategory: (category: WardrobeCategory | 'all') => void
  setFilterMode: (mode: FilterMode) => void
  setSortBy: (sort: SortMode) => void
  setSearchQuery: (query: string) => void

  // Действия: импорт/экспорт
  exportData: () => Promise<string>
  importData: (jsonData: string) => Promise<void>

  // Вычисляемые
  getFilteredItems: () => WardrobeItem[]
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  stories: [],
  selectedStoryId: null,
  currentItems: [],
  storyStats: null,
  overallStats: null,
  isLoading: false,
  error: null,
  activeCategory: 'all',
  filterMode: 'all',
  sortBy: 'newest',
  searchQuery: '',

  // Истории
  loadStories: async () => {
    set({ isLoading: true, error: null })
    try {
      const stories = await wardrobeService.getAllStories()
      set({ stories, isLoading: false })
    } catch (error) {
      set({ error: 'Ошибка загрузки историй', isLoading: false })
    }
  },

  selectStory: (storyId) => {
    set({ selectedStoryId: storyId, activeCategory: 'all', filterMode: 'all', sortBy: 'newest', searchQuery: '' })
    if (storyId) {
      get().loadItems(storyId)
      get().loadStoryStats(storyId)
    } else {
      set({ currentItems: [], storyStats: null })
    }
  },

  createStory: async (input) => {
    const story = await wardrobeService.createStory(input)
    await get().loadStories()
    await get().loadOverallStats()
    return story
  },

  updateStory: async (id, input) => {
    await wardrobeService.updateStory(id, input)
    await get().loadStories()
    if (get().selectedStoryId === id) await get().loadStoryStats(id)
    await get().loadOverallStats()
  },

  deleteStory: async (id) => {
    await wardrobeService.deleteStory(id)
    if (get().selectedStoryId === id) set({ selectedStoryId: null, currentItems: [], storyStats: null })
    await get().loadStories()
    await get().loadOverallStats()
  },

  refreshStories: async () => {
    await get().loadStories()
    await get().loadOverallStats()
  },

  // Предметы
  loadItems: async (storyId) => {
    set({ isLoading: true, error: null })
    try {
      const items = await wardrobeService.getItemsByStory(storyId)
      set({ currentItems: items, isLoading: false })
    } catch (error) {
      set({ error: 'Ошибка загрузки предметов', isLoading: false })
    }
  },

  createItem: async (input) => {
    const item = await wardrobeService.createItem(input)
    await get().refreshItems()
    return item
  },

  updateItem: async (id, input) => {
    await wardrobeService.updateItem(id, input)
    await get().refreshItems()
  },

  deleteItem: async (id) => {
    await wardrobeService.deleteItem(id)
    await get().refreshItems()
  },

  toggleOwned: async (id) => {
    await wardrobeService.toggleOwned(id)
    await get().refreshItems()
  },

  refreshItems: async () => {
    const { selectedStoryId } = get()
    if (selectedStoryId) {
      await get().loadItems(selectedStoryId)
      await get().loadStoryStats(selectedStoryId)
    }
    await get().loadOverallStats()
  },

  // Статистика
  loadOverallStats: async () => {
    try {
      const stats = await wardrobeService.getOverallStats()
      set({ overallStats: stats })
    } catch (error) {
      console.error('Ошибка загрузки общей статистики:', error)
    }
  },

  loadStoryStats: async (storyId) => {
    try {
      const stats = await wardrobeService.getStoryStats(storyId)
      set({ storyStats: stats })
    } catch (error) {
      console.error('Ошибка загрузки статистики истории:', error)
    }
  },

  // Фильтры
  setActiveCategory: (category) => set({ activeCategory: category }),
  setFilterMode: (mode) => set({ filterMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Импорт/экспорт
  exportData: async () => wardrobeService.exportData(),

  importData: async (jsonData) => {
    await wardrobeService.importData(jsonData)
    await get().loadStories()
    await get().loadOverallStats()
    set({ selectedStoryId: null, currentItems: [], storyStats: null })
  },

  // Вычисляемые
  getFilteredItems: () => {
    const { currentItems, activeCategory, filterMode, sortBy, searchQuery } = get()
    let filtered = [...currentItems]

    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory)
    }

    if (filterMode === 'owned') {
      filtered = filtered.filter(item => item.isOwned)
    } else if (filterMode === 'missing') {
      filtered = filtered.filter(item => !item.isOwned)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(item => item.name.toLowerCase().includes(query))
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
        break
      case 'season':
        filtered.sort((a, b) => a.season - b.season || a.episode - b.episode)
        break
    }

    return filtered
  },
}))