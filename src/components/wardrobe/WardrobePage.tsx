import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Sparkles, Search, Zap, FileText, Clock, ArrowUpDown } from 'lucide-react'
import { useWardrobeStore } from '../../store/wardrobeStore'
import CategoryTabs from './CategoryTabs'
import ItemGrid from './ItemGrid'
import ProgressBar from './ProgressBar'
import AddItemModal from '../forms/AddItemModal'
import EditItemModal from '../forms/EditItemModal'
import BulkImportModal from '../forms/BulkImportModal'
import Button from '../ui/Button'
import type { WardrobeCategory, WardrobeItem } from '../../core/types/wardrobe'

type FilterMode = 'all' | 'owned' | 'missing'
type SortMode = 'newest' | 'oldest' | 'name' | 'season'

export default function WardrobePage() {
  const { storyId } = useParams<{ storyId: string }>()
  const navigate = useNavigate()

  const {
    stories,
    currentItems,
    storyStats,
    isLoading,
    activeCategory,
    searchQuery,
    filterMode,
    sortBy,
    loadStories,
    selectStory,
    setActiveCategory,
    setSearchQuery,
    setFilterMode,
    setSortBy,
    getFilteredItems,
  } = useWardrobeStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [quickAddMode, setQuickAddMode] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null)
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
              {currentStory?.totalSeasons} сез. • Сейчас: Сезон {currentStory?.currentSeason}, Серия {currentStory?.currentEpisode}
            </p>
          </div>
        </div>

        {/* Кнопки добавления */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => {
              setQuickAddMode(false)
              setIsAddModalOpen(true)
            }}
            icon={<Plus size={18} />}
            size="sm"
          >
            Добавить
          </Button>
          <Button
            onClick={() => {
              setQuickAddMode(true)
              setIsAddModalOpen(true)
            }}
            icon={<Zap size={18} />}
            variant="secondary"
            size="sm"
          >
            Быстрое
          </Button>
          <Button
            onClick={() => setIsBulkImportOpen(true)}
            icon={<FileText size={18} />}
            variant="ghost"
            size="sm"
          >
            Импорт
          </Button>
        </div>
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

      {/* Фильтры, сортировка и поиск */}
      <div className="space-y-3">
        {/* Строка с категориями и фильтрами */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            <CategoryTabs
              activeCategory={activeCategory}
              onChange={setActiveCategory}
              counts={categoryCounts}
            />
          </div>

          {/* Кнопки фильтрации: Все / Есть / Нет */}
          <div className="flex items-center gap-1 bg-romantic-pink/30 rounded-2xl p-1">
            {([
              { value: 'all' as FilterMode, label: 'Все', icon: '👗' },
              { value: 'owned' as FilterMode, label: 'Есть', icon: '✅' },
              { value: 'missing' as FilterMode, label: 'Нет', icon: '🔒' },
            ]).map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilterMode(btn.value)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-nunito font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${filterMode === btn.value
                    ? 'bg-white text-romantic-dark shadow-sm'
                    : 'text-romantic-dark/50 hover:text-romantic-dark'
                  }
                `}
              >
                <span>{btn.icon}</span>
                <span className="hidden sm:inline">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Сортировка */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-romantic-dark/40 font-nunito flex items-center gap-1">
            <ArrowUpDown size={12} />
            Сортировка:
          </span>
          <div className="flex items-center gap-1 bg-romantic-pink/20 rounded-2xl p-1">
            {([
              { value: 'newest' as SortMode, icon: <Clock size={13} />, label: 'Новые' },
              { value: 'oldest' as SortMode, icon: <Clock size={13} className="rotate-180" />, label: 'Старые' },
              { value: 'name' as SortMode, icon: <span className="text-xs font-bold">А-Я</span>, label: 'Имя' },
              { value: 'season' as SortMode, icon: <span className="text-xs font-bold">С</span>, label: 'Сезон' },
            ]).map((btn) => (
              <button
                key={btn.value}
                onClick={() => setSortBy(btn.value)}
                className={`
                  flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-nunito font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${sortBy === btn.value
                    ? 'bg-white text-romantic-dark shadow-sm'
                    : 'text-romantic-dark/50 hover:text-romantic-dark'
                  }
                `}
                title={btn.label}
              >
                {btn.icon}
                <span className="hidden sm:inline">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Поиск */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-romantic-dark/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-romantic-gold/20 
                       bg-white/70 text-sm text-romantic-dark font-nunito text-base
                       placeholder:text-romantic-dark/30
                       focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20"
          />
        </div>
      </div>

      {/* Сетка нарядов */}
      <ItemGrid
        items={filteredItems}
        isLoading={isLoading}
        onEditItem={(item) => setEditingItem(item)}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {/* Модалка добавления наряда */}
      {storyId && (
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            setQuickAddMode(false)
          }}
          storyId={storyId}
          quickMode={quickAddMode}
        />
      )}

      {/* Модалка редактирования наряда */}
      <EditItemModal
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        item={editingItem}
      />

      {/* Модалка массового импорта */}
      {storyId && (
        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          storyId={storyId}
        />
      )}
    </div>
  )
}