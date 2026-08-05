import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Sparkles } from 'lucide-react'
import StoryCard from './StoryCard'
import AddStoryModal from '../forms/AddStoryModal'
import EditStoryModal from '../forms/EditStoryModal'
import EmptyState from '../ui/EmptyState'
import { CardSkeleton } from '../ui/Skeleton'
import { useWardrobeStore } from '../../store/wardrobeStore'
import type { Story } from '../../core/types/wardrobe'

export default function StoriesList() {
  const navigate = useNavigate()
  const { stories, loadStories, loadOverallStats, isLoading, overallStats } = useWardrobeStore()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<Story | null>(null)

  useEffect(() => {
    loadStories()
    loadOverallStats()
  }, [loadStories, loadOverallStats])

  const storyProgressMap = useMemo(() => {
    if (!overallStats?.storiesBreakdown) return {}
    const map: Record<string, number> = {}
    overallStats.storiesBreakdown.forEach((item) => {
      map[item.storyId] = item.percentage
    })
    return map
  }, [overallStats])

  const handleStoryClick = (storyId: string) => {
    navigate(`/story/${storyId}`)
  }

  // Загрузка
  if (isLoading && stories.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="h-9 w-48 mx-auto bg-romantic-pink/30 rounded-xl animate-pulse" />
          <div className="h-0.5 w-48 mx-auto bg-romantic-pink/30 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Пустое состояние
  if (stories.length === 0) {
    return (
      <div className="space-y-8">
        <EmptyState
          icon={<BookOpen size={48} />}
          title="Здесь пока пусто"
          description="Добавь свою первую историю из «Клуба Романтики» и начни отслеживать гардероб"
          action={{
            label: 'Добавить историю',
            onClick: () => setIsAddModalOpen(true),
            icon: <Plus size={18} />,
          }}
        />
        <AddStoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    )
  }

  // Список историй
  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Sparkles size={24} className="text-romantic-gold" />
          <h2 className="font-cormorant text-3xl font-bold text-romantic-dark">
            Мои истории
          </h2>
          <Sparkles size={24} className="text-romantic-gold" />
        </div>
        <hr className="golden-divider max-w-md mx-auto" />
        
        {overallStats && (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-nunito">
            <span className="text-romantic-dark/60">
              📚 {overallStats.totalStories} историй
            </span>
            <span className="text-romantic-gold font-semibold">
              👗 {overallStats.ownedItems} / {overallStats.totalItems} нарядов
            </span>
            <span className="text-romantic-crimson font-semibold">
              💎 {overallStats.totalDiamondsSpent} алмазов
            </span>
          </div>
        )}
      </div>

      {/* Кнопка добавления */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 
                     bg-gradient-to-r from-romantic-gold to-romantic-lightGold
                     text-romantic-darker font-nunito font-semibold rounded-2xl
                     shadow-magic-lg hover:shadow-xl
                     transform hover:scale-105 active:scale-95
                     transition-all duration-200"
        >
          <Plus size={20} />
          <span>Добавить историю</span>
        </button>
      </div>

      {/* Сетка */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            progress={storyProgressMap[story.id] || 0}
            onClick={() => handleStoryClick(story.id)}
            onEdit={() => setEditingStory(story)}
          />
        ))}
      </div>

      {/* Модалки */}
      <AddStoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <EditStoryModal
        isOpen={editingStory !== null}
        onClose={() => setEditingStory(null)}
        story={editingStory}
      />
    </div>
  )
}