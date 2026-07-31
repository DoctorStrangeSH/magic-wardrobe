import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Sparkles, Filter, Search } from 'lucide-react'
import { useWardrobeStore } from '../../store/wardrobeStore'
import CategoryTabs from './CategoryTabs'
import ItemGrid from './ItemGrid'
import ProgressBar from './ProgressBar'
import AddItemModal from '../forms/AddItemModal'
import Button from '../ui/Button'
import type { WardrobeCategory } from '../../core/types/wardrobe'
import { motion } from 'framer-motion'

export default function WardrobePage() {
  const { storyId } = useParams<{ storyId: string }>()
  const navigate = useNavigate()

  const {
    stories,
    currentItems,
    storyStats,
    isLoading,
    activeCategory,
    showOnlyOwned,
    showOnlyWishlist,
    searchQuery,
    loadStories,
    selectStory,
    setActiveCategory,
    setShowOnlyOwned,
    setShowOnlyWishlist,
    setSearchQuery,
    getFilteredItems,
  } = useWardrobeStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Загружаем данные при монтировании и при смене storyId
  useEffect(() => {
    const init = async () => {
      if (stories.length === 0) {
        await loadStories()
      }
      if (storyId) {
        selectStory(storyId)
      }
      setIsInitialized(true)
    }
    init()
  }, [storyId])

  // Находим текущую историю
  const currentStory = useMemo(
    () => stories.find((s) => s.id === storyId),
    [stories, storyId]
  )

  const filteredItems = getFilteredItems()

  const categoryCounts = useMemo(() => {
    const counts: Record<WardrobeCategory | 'all', number> = {
      all: currentItems.length,
      dress: 0,
      hairstyle: 0,
      accessory: 0,
      makeup: 0,
    }
    currentItems.forEach((item) => {
      counts[item.category]++
    })
    return counts
  }, [currentItems])

  // Показываем загрузку, пока инициализируемся
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles size={48} className="text-romantic-gold/50" />
        </motion.div>
      </div>
    )
  }

  // Если история не найдена после загрузки
  if (!currentStory && isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Sparkles size={48} className="text-romantic-gold/30 mb-4" />
        <p className="text-romantic-dark/50 font-cormorant text-xl">История не найдена</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          ← Вернуться к списку историй
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-romantic-gold/60 hover:text-romantic-gold 
                       hover:bg-romantic-pink/50 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="font-cormorant text-2xl font-bold text-romantic-dark">
              {currentStory?.title}
            </h1>
            <p className="text-sm text-romantic-dark/50 font-nunito">
              {currentStory?.totalSeasons} сез. • Сейчас: С{currentStory?.currentSeason} С{currentStory?.currentEpisode}
            </p>
          </div>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} icon={<Plus size={18} />}>
          Добавить наряд
        </Button>
      </div>

      {/* Прогресс-бар */}
      {storyStats && (
        <div className="romantic-card rounded-2xl p-5 shadow-card space-y-4">
          <ProgressBar value={storyStats.percentage} label="Прогресс гардероба" size="lg" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['dress', 'hairstyle', 'accessory', 'makeup'] as WardrobeCategory[]).map((cat) => {
              const catStats = storyStats.byCategory[cat]
              return (
                <div key={cat} className="text-center">
                  <div className="text-xs text-romantic-dark/50 font-nunito mb-1">
                    {cat === 'dress' ? '👗' : cat === 'hairstyle' ? '💇‍♀️' : cat === 'accessory' ? '💍' : '💄'}
                  </div>
                  <div className="text-sm font-nunito font-bold text-romantic-dark">
                    {catStats.owned}/{catStats.total}
                  </div>
                  <ProgressBar
                    value={catStats.percentage}
                    size="sm"
                    showPercentage={false}
                    color={catStats.percentage === 100 ? 'emerald' : 'gold'}
                  />
                </div>
              )
            })}
          </div>

          {storyStats.totalDiamondsSpent > 0 && (
            <p className="text-xs text-romantic-dark/50 font-nunito text-center">
              💎 Потрачено алмазов: <span className="font-bold text-romantic-crimson">{storyStats.totalDiamondsSpent}</span>
            </p>
          )}
        </div>
      )}

      {/* Фильтры */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <CategoryTabs
              activeCategory={activeCategory}
              onChange={setActiveCategory}
              counts={categoryCounts}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl transition-colors ${
              showFilters || showOnlyOwned || showOnlyWishlist
                ? 'bg-romantic-gold/20 text-romantic-gold'
                : 'text-romantic-dark/50 hover:text-romantic-dark hover:bg-romantic-pink/50'
            }`}
          >
            <Filter size={20} />
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 flex-wrap p-4 romantic-card rounded-2xl">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-romantic-dark/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-romantic-gold/20 
                           bg-white/70 text-sm text-romantic-dark font-nunito text-base
                           placeholder:text-romantic-dark/30
                           focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyOwned}
                onChange={(e) => setShowOnlyOwned(e.target.checked)}
                className="w-4 h-4 rounded border-romantic-gold/40 checked:bg-romantic-gold"
              />
              <span className="text-sm text-romantic-dark/70 font-nunito">✅ Только имеющиеся</span>
            </label>
          </div>
        )}
      </div>

      {/* Сетка нарядов */}
      <ItemGrid items={filteredItems} isLoading={isLoading} />

      {/* Модалка добавления наряда */}
      {storyId && (
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          storyId={storyId}
        />
      )}
    </div>
  )
}