import { create } from 'zustand'
import type { Story, WardrobeItem, CreateStoryInput, CreateWardrobeItemInput, UpdateStoryInput, UpdateWardrobeItemInput, StoryStats, OverallStats, WardrobeCategory } from '../core/types/wardrobe'
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
  selectStory: (id: string | null) => void
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
  loadStoryStats: (id: string) => Promise<void>
  setActiveCategory: (c: WardrobeCategory | 'all') => void
  setFilterMode: (m: FilterMode) => void
  setSortBy: (s: SortMode) => void
  setSearchQuery: (q: string) => void
  exportData: () => Promise<string>
  importData: (json: string) => Promise<void>
  getFilteredItems: () => WardrobeItem[]
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  stories: [], selectedStoryId: null, currentItems: [], storyStats: null, overallStats: null,
  isLoading: false, error: null, activeCategory: 'all', filterMode: 'all', sortBy: 'newest', searchQuery: '',

  loadStories: async () => {
    set({ isLoading: true })
    try { set({ stories: await wardrobeService.getAllStories(), isLoading: false }) } 
    catch { set({ error: 'Ошибка', isLoading: false }) }
  },

  selectStory: (id) => {
    set({ selectedStoryId: id, activeCategory: 'all', filterMode: 'all', sortBy: 'newest', searchQuery: '' })
    if (id) { Promise.all([get().loadItems(id), get().loadStoryStats(id)]) } 
    else { set({ currentItems: [], storyStats: null }) }
  },

  createStory: async (input) => { const s = await wardrobeService.createStory(input); await get().loadStories(); await get().loadOverallStats(); return s },
  updateStory: async (id, input) => { await wardrobeService.updateStory(id, input); await get().loadStories(); if (get().selectedStoryId === id) get().loadStoryStats(id); await get().loadOverallStats() },
  deleteStory: async (id) => { await wardrobeService.deleteStory(id); if (get().selectedStoryId === id) set({ selectedStoryId: null, currentItems: [], storyStats: null }); await get().loadStories(); await get().loadOverallStats() },

  loadItems: async (storyId) => {
    set({ isLoading: true })
    try {
      const items = await wardrobeService.getItemsByStory(storyId)
      const progress = await wardrobeService.getUserProgress(storyId)
      set({ currentItems: items.map(i => ({ ...i, is_owned: progress[i.id] || false })), isLoading: false })
    } catch { set({ isLoading: false }) }
  },

  createItem: async (input) => { const i = await wardrobeService.createItem(input); await get().refreshItems(); return i },
  updateItem: async (id, input) => { await wardrobeService.updateItem(id, input); await get().refreshItems() },
  deleteItem: async (id) => { await wardrobeService.deleteItem(id); await get().refreshItems() },

  toggleOwned: async (id) => {
    await wardrobeService.toggleOwned(id)
    set({ currentItems: get().currentItems.map(i => i.id === id ? { ...i, is_owned: !i.is_owned } : i) })
    if (get().selectedStoryId) get().loadStoryStats(get().selectedStoryId!)
    get().loadOverallStats()
  },

  refreshItems: async () => {
    const sid = get().selectedStoryId
    if (sid) { await get().loadItems(sid); await get().loadStoryStats(sid) }
    await get().loadOverallStats()
  },

  loadOverallStats: async () => { try { set({ overallStats: await wardrobeService.getOverallStats() }) } catch {} },
  loadStoryStats: async (id) => { try { set({ storyStats: await wardrobeService.getStoryStats(id) }) } catch {} },

  setActiveCategory: (c) => set({ activeCategory: c }),
  setFilterMode: (m) => set({ filterMode: m }),
  setSortBy: (s) => set({ sortBy: s }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  exportData: async () => wardrobeService.exportData(),
  importData: async (json) => { await wardrobeService.importData(json); await get().loadStories(); await get().loadOverallStats(); set({ selectedStoryId: null, currentItems: [], storyStats: null }) },

  getFilteredItems: () => {
    const { currentItems, activeCategory, filterMode, sortBy, searchQuery } = get()
    let f = [...currentItems]
    if (activeCategory !== 'all') f = f.filter(i => i.category === activeCategory)
    if (filterMode === 'owned') f = f.filter(i => i.is_owned)
    else if (filterMode === 'missing') f = f.filter(i => !i.is_owned)
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); f = f.filter(i => i.name.toLowerCase().includes(q)) }
    switch (sortBy) {
      case 'newest': f.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)); break
      case 'oldest': f.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)); break
      case 'name': f.sort((a, b) => a.name.localeCompare(b.name, 'ru')); break
      case 'season': f.sort((a, b) => a.season - b.season || a.episode - b.episode); break
    }
    return f
  },
}))