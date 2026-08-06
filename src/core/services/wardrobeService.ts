import { supabase } from '../supabase/client'
import type {
  Story, WardrobeItem, CreateStoryInput, CreateWardrobeItemInput,
  UpdateStoryInput, UpdateWardrobeItemInput, StoryStats, OverallStats, WardrobeCategory,
} from '../types/wardrobe'

export const wardrobeService = {
  // ─── ИСТОРИИ ────────────────────────────────

  async getAllStories(): Promise<Story[]> {
    const { data, error } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Story[]
  },

  async getStoryById(id: string): Promise<Story | undefined> {
    const { data, error } = await supabase.from('stories').select('*').eq('id', id).single()
    if (error) return undefined
    return data as Story
  },

  async createStory(input: CreateStoryInput): Promise<Story> {
    const { data, error } = await supabase
      .from('stories')
      .insert({
        title: input.title,
        cover: input.cover || null,
        total_seasons: input.total_seasons || 1,
        status: input.status || 'playing',
        current_season: input.current_season || 1,
        current_episode: input.current_episode || 1,
        notes: input.notes || '',
      })
      .select()
      .single()

    if (error) throw error
    return data as Story
  },

  async updateStory(id: string, input: UpdateStoryInput): Promise<void> {
    const updateData: Record<string, any> = {}
    if (input.title !== undefined) updateData.title = input.title
    if (input.cover !== undefined) updateData.cover = input.cover
    if (input.total_seasons !== undefined) updateData.total_seasons = input.total_seasons
    if (input.status !== undefined) updateData.status = input.status
    if (input.current_season !== undefined) updateData.current_season = input.current_season
    if (input.current_episode !== undefined) updateData.current_episode = input.current_episode
    if (input.notes !== undefined) updateData.notes = input.notes

    const { error } = await supabase.from('stories').update(updateData).eq('id', id)
    if (error) throw error
  },

  async deleteStory(id: string): Promise<void> {
    const { error } = await supabase.from('stories').delete().eq('id', id)
    if (error) throw error
  },

  // ─── ПРЕДМЕТЫ ГАРДЕРОБА ────────────────────

  async getItemsByStory(story_id: string): Promise<WardrobeItem[]> {
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('story_id', story_id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as WardrobeItem[]
  },

  async createItem(input: CreateWardrobeItemInput): Promise<WardrobeItem> {
    const { data, error } = await supabase
      .from('wardrobe_items')
      .insert({
        story_id: input.story_id,
        category: input.category,
        name: input.name,
        image: input.image || null,
        season: input.season,
        episode: input.episode,
        cost_type: input.cost_type || 'free',
        diamond_cost: input.diamond_cost || 0,
        stat_name: input.stat_name || '',
        stat_cost: input.stat_cost || 0,
        notes: input.notes || '',
      })
      .select()
      .single()
    if (error) throw error
    return data as WardrobeItem
  },

  async updateItem(id: string, input: UpdateWardrobeItemInput): Promise<void> {
    const updateData: Record<string, any> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.category !== undefined) updateData.category = input.category
    if (input.image !== undefined) updateData.image = input.image
    if (input.season !== undefined) updateData.season = input.season
    if (input.episode !== undefined) updateData.episode = input.episode
    if (input.cost_type !== undefined) updateData.cost_type = input.cost_type
    if (input.diamond_cost !== undefined) updateData.diamond_cost = input.diamond_cost
    if (input.stat_name !== undefined) updateData.stat_name = input.stat_name
    if (input.stat_cost !== undefined) updateData.stat_cost = input.stat_cost
    if (input.notes !== undefined) updateData.notes = input.notes

    const { error } = await supabase.from('wardrobe_items').update(updateData).eq('id', id)
    if (error) throw error
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from('wardrobe_items').delete().eq('id', id)
    if (error) throw error
  },

  async toggleOwned(item_id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Не авторизован')

    const { data: existing } = await supabase
      .from('user_progress').select('*')
      .eq('user_id', user.id).eq('item_id', item_id)
      .maybeSingle()

    if (existing) {
      await supabase.from('user_progress').update({ is_owned: !existing.is_owned }).eq('id', existing.id)
    } else {
      await supabase.from('user_progress').insert({ user_id: user.id, item_id, is_owned: true })
    }
  },

  async getUserProgress(story_id: string): Promise<Record<string, boolean>> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {}

    if (story_id) {
      const { data: items } = await supabase.from('wardrobe_items').select('id').eq('story_id', story_id)
      if (!items || items.length === 0) return {}
      const { data: progress } = await supabase
        .from('user_progress').select('item_id, is_owned')
        .eq('user_id', user.id).in('item_id', items.map(i => i.id))
      const map: Record<string, boolean> = {}
      progress?.forEach(p => { map[p.item_id] = p.is_owned })
      return map
    } else {
      const { data: progress } = await supabase.from('user_progress').select('item_id, is_owned').eq('user_id', user.id)
      const map: Record<string, boolean> = {}
      progress?.forEach(p => { map[p.item_id] = p.is_owned })
      return map
    }
  },

  async getStoryStats(storyId: string): Promise<StoryStats | null> {
    const story = await this.getStoryById(storyId)
    if (!story) return null

    const items = await this.getItemsByStory(storyId)
    const progress = await this.getUserProgress(storyId)
    const ownedItems = items.filter(i => progress[i.id])
    const pct = (n: number, total: number) => total > 0 ? Math.round((n / total) * 100) : 0

    const categories: WardrobeCategory[] = ['dress', 'hairstyle', 'accessory', 'makeup']
    const byCategory = {} as StoryStats['byCategory']
    for (const cat of categories) {
      const catItems = items.filter(i => i.category === cat)
      const catOwned = catItems.filter(i => progress[i.id])
      byCategory[cat] = { total: catItems.length, owned: catOwned.length, percentage: pct(catOwned.length, catItems.length) }
    }

    return {
      storyId, storyTitle: story.title, totalItems: items.length, ownedItems: ownedItems.length,
      percentage: pct(ownedItems.length, items.length), byCategory,
      totalDiamondsSpent: ownedItems.filter(i => i.cost_type === 'diamond').reduce((s, i) => s + i.diamond_cost, 0),
      totalStatsSpent: ownedItems.filter(i => i.cost_type === 'stats').reduce((s, i) => s + i.stat_cost, 0),
    }
  },

  async getOverallStats(): Promise<OverallStats> {
    const stories = await this.getAllStories()
    const { data: allItems } = await supabase.from('wardrobe_items').select('*')
    const progress = await this.getUserProgress('')
    const ownedItems = (allItems || []).filter(i => progress[i.id])
    const pct = (n: number, total: number) => total > 0 ? Math.round((n / total) * 100) : 0

    return {
      totalStories: stories.length,
      completedStories: stories.filter(s => s.status === 'completed').length,
      totalItems: allItems?.length || 0,
      ownedItems: ownedItems.length,
      overallPercentage: pct(ownedItems.length, allItems?.length || 0),
      totalDiamondsSpent: ownedItems.filter(i => i.cost_type === 'diamond').reduce((s, i) => s + i.diamond_cost, 0),
      totalStatsSpent: ownedItems.filter(i => i.cost_type === 'stats').reduce((s, i) => s + i.stat_cost, 0),
      wishlistItems: 0,
      storiesBreakdown: stories.map(story => {
        const si = (allItems || []).filter(i => i.story_id === story.id)
        const so = si.filter(i => progress[i.id])
        return { storyId: story.id, storyTitle: story.title, percentage: pct(so.length, si.length), ownedItems: so.length, totalItems: si.length }
      }),
    }
  },

  async exportData(): Promise<string> {
    const stories = await this.getAllStories()
    const { data: items } = await supabase.from('wardrobe_items').select('*')
    const { data: { user } } = await supabase.auth.getUser()
    let progress: any[] = []
    if (user) {
      const { data: p } = await supabase.from('user_progress').select('*').eq('user_id', user.id)
      progress = p || []
    }
    return JSON.stringify({ stories, items, progress, exportDate: new Date().toISOString() }, null, 2)
  },

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData)

    // Конвертируем camelCase в snake_case для историй
    if (data.stories?.length > 0) {
      const stories = data.stories.map((s: any) => ({
        id: s.id,
        title: s.title,
        cover: s.cover,
        total_seasons: s.total_seasons || s.totalSeasons || 1,
        status: s.status,
        current_season: s.current_season || s.currentSeason || 1,
        current_episode: s.current_episode || s.currentEpisode || 1,
        notes: s.notes || '',
        created_at: s.created_at || s.createdAt || new Date().toISOString(),
        updated_at: s.updated_at || s.updatedAt || new Date().toISOString(),
      }))

      const { error } = await supabase.from('stories').insert(stories)
      if (error) throw error
    }

    // Конвертируем camelCase в snake_case для нарядов
    if (data.items?.length > 0) {
      const items = data.items.map((i: any) => ({
        id: i.id,
        story_id: i.story_id || i.storyId,
        category: i.category,
        name: i.name,
        image: i.image,
        season: i.season,
        episode: i.episode,
        cost_type: i.cost_type || i.costType || 'free',
        diamond_cost: i.diamond_cost || i.diamondCost || 0,
        stat_name: i.stat_name || i.statName || '',
        stat_cost: i.stat_cost || i.statCost || 0,
        notes: i.notes || '',
        created_at: i.created_at || i.createdAt || new Date().toISOString(),
        updated_at: i.updated_at || i.updatedAt || new Date().toISOString(),
      }))

      for (let i = 0; i < items.length; i += 50) {
        const { error } = await supabase.from('wardrobe_items').insert(items.slice(i, i + 50))
        if (error) throw error
      }
    }

    if (data.progress?.length > 0) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const progress = data.progress.map((p: any) => ({
          user_id: user.id,
          item_id: p.item_id || p.itemId,
          is_owned: p.is_owned !== undefined ? p.is_owned : (p.isOwned || false),
        }))
        const { error } = await supabase.from('user_progress').insert(progress)
        if (error) throw error
      }
    }
  },
}