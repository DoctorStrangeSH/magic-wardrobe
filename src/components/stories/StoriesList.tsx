import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Sparkles } from 'lucide-react'
import StoryCard from './StoryCard'
import AddStoryModal from '../forms/AddStoryModal'
import { useWardrobeStore } from '../../store/wardrobeStore'

export default function StoriesList() {
  const navigate = useNavigate()
  const { stories, loadStories, overallStats, selectStory } = useWardrobeStore()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Загружаем истории при монтировании
  useEffect(() => {
    loadStories()
  }, [loadStories])

  // Вычисляем прогресс для каждой истории из overallStats
  const storyProgressMap = useMemo(() => {
    if (!overallStats?.storiesBreakdown) return {}
    const map: Record<string, number> = {}
    overallStats.storiesBreakdown.forEach((item) => {
      map[item.storyId] = item.percentage
    })
    return map
  }, [overallStats])

  // Обработчик клика по карточке истории
  const handleStoryClick = (storyId: string) => {
    navigate(`/story/${storyId}`)
  }

  return (
    <div className="space-y-8">
      {/* Заголовок страницы */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Sparkles size={24} className="text-romantic-gold" />
          <h2 className="font-cormorant text-3xl font-bold text-romantic-dark">
            Мои истории
          </h2>
          <Sparkles size={24} className="text-romantic-gold" />
        </div>
        <hr className="golden-divider max-w-md mx-auto" />
        
        {overallStats && stories.length > 0 && (
          <div className="flex items-center justify-center gap-6 text-sm font-nunito">
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

      {/* Кнопка "Добавить историю" */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="
            flex items-center gap-2 px-6 py-3 
            bg-gradient-to-r from-romantic-gold to-romantic-lightGold
            text-romantic-darker font-nunito font-semibold rounded-2xl
            shadow-magic-lg hover:shadow-card-hover
            transform hover:scale-105 active:scale-95
            transition-all duration-200
          "
        >
          <Plus size={20} />
          <span>Добавить историю</span>
        </button>
      </div>

      {/* Сетка историй или пустое состояние */}
      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          {/* Декоративная иконка */}
          <div className="w-32 h-32 mb-6 rounded-full bg-romantic-pink/30 flex items-center justify-center animate-float">
            <BookOpen size={48} className="text-romantic-gold/50" />
          </div>
          
          <h3 className="font-cormorant text-2xl text-romantic-dark/60 mb-2">
            Здесь пока пусто
          </h3>
          <p className="text-romantic-gold/50 font-nunito text-sm text-center max-w-md">
            Нажми на волшебную кнопку выше, чтобы добавить свою первую историю из "Клуба Романтики" 
            и начать отслеживать свой гардероб ✨
          </p>

          {/* Декоративные элементы */}
          <div className="flex gap-1 mt-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-romantic-gold/30 animate-shimmer"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              progress={storyProgressMap[story.id] || 0}
              onClick={() => handleStoryClick(story.id)}
            />
          ))}
        </div>
      )}

      {/* Модалка добавления истории */}
      <AddStoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}