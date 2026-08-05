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
  stories: Story[]
  selectedStoryId: string | null
  currentItems: WardrobeItem[]
  storyStats: StoryStats | null
  overallStats: OverallStats | null

  isLoading: boolean
  error: string | null
  activeCategory: WardrobeCategory | 'all'
  filterMode: FilterMode
  sortBy: SortMode
  searchQuery: string

  loadStories: () => Promise<void>
  selectStory: (storyId: string | null) => void
  createStory: (input: CreateStoryInput) => Promise<Story>
  updateStory: (id: string, input: UpdateStoryInput) => Promise<void>
  deleteStory: (id: string) => Promise<void>

  loadItems: (storyId: string) => Promise<void>
  createItem: (input: CreateWardrobeItemInput) => Promise<WardrobeItem>
  updateItem: (id: string, input: UpdateWardrobeItemInput) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  toggleOwned: (id: string) => Promise<void>
  refreshItems: () => Promise<void>

  loadOverallStats: () => Promise<void>
  loadStoryStats: (storyId: string) => Promise<void>

  setActiveCategory: (category: WardrobeCategory | 'all') => void
  setFilterMode: (mode: FilterMode) => void
  setSortBy: (sort: SortMode) => void
  setSearchQuery: (query: string) => void

  exportData: () => Promise<string>
  importData: (jsonData: string) => Promise<void>

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

  loadStories: async () => {
    set({ isLoading: true, error: null })
    try {
      const stories = await wardrobeService.getAllStories()
      set({ stories, isLoading: false })
    } catch {
      set({ error: 'Ошибка загрузки историй', isLoading: false })
    }
  },

  selectStory: (storyId) => {
    set({ selectedStoryId: storyId, activeCategory: 'all', filterMode: 'all', sortBy: 'newest', searchQuery: '' })
    if (storyId) {
      Promise.all([get().loadItems(storyId), get().loadStoryStats(storyId)])
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

  loadItems: async (storyId) => {
    set({ isLoading: true })
    try {
      const items = await wardrobeService.getItemsByStory(storyId)
      set({ currentItems: items, isLoading: false })
    } catch {
      set({ isLoading: false })
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

  loadOverallStats: async () => {
    try {
      const stats = await wardrobeService.getOverallStats()
      set({ overallStats: stats })
    } catch { }
  },

  loadStoryStats: async (storyId) => {
    try {
      const stats = await wardrobeService.getStoryStats(storyId)
      set({ storyStats: stats })
    } catch { }
  },

  setActiveCategory: (category) => set({ activeCategory: category }),
  setFilterMode: (mode) => set({ filterMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  exportData: async () => wardrobeService.exportData(),

  importData: async (jsonData) => {
    await wardrobeService.importData(jsonData)
    await get().loadStories()
    await get().loadOverallStats()
    set({ selectedStoryId: null, currentItems: [], storyStats: null })
  },

  getFilteredItems: () => {
    const { currentItems, activeCategory, filterMode, sortBy, searchQuery } = get()
    let filtered = [...currentItems]

    if (activeCategory !== 'all') filtered = filtered.filter(i => i.category === activeCategory)
    if (filterMode === 'owned') filtered = filtered.filter(i => i.isOwned)
    else if (filterMode === 'missing') filtered = filtered.filter(i => !i.isOwned)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(i => i.name.toLowerCase().includes(q))
    }

    switch (sortBy) {
      case 'newest': filtered.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break
      case 'oldest': filtered.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)); break
      case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name, 'ru')); break
      case 'season': filtered.sort((a, b) => a.season - b.season || a.episode - b.episode); break
    }

    return filtered
  },
}))