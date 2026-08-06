import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, TrendingUp, ChevronRight, Filter, BarChart3 } from 'lucide-react'
import { useWardrobeStore } from '../../store/wardrobeStore'
import StatsSummary from './StatsSummary'
import ProgressBar from '../wardrobe/ProgressBar'
import { StatsSkeleton } from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { stories, overallStats, loadStories, loadOverallStats } = useWardrobeStore()
  const [sortBy, setSortBy] = useState<'percentage' | 'title' | 'items'>('percentage')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      await loadStories()
      await loadOverallStats()
      setIsLoaded(true)
    }
    loadData()
  }, [loadStories, loadOverallStats])

  // Загрузка
  if (!isLoaded || !overallStats) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="h-9 w-56 mx-auto bg-romantic-pink/30 rounded-xl animate-pulse" />
          <div className="h-0.5 w-48 mx-auto bg-romantic-pink/30 rounded-full" />
        </div>
        <StatsSkeleton />
        <div className="h-24 bg-romantic-pink/20 rounded-2xl animate-pulse" />
      </div>
    )
  }

  // Нет историй
  if (overallStats.totalStories === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Sparkles size={24} className="text-romantic-gold" />
            <h2 className="font-cormorant text-3xl font-bold text-romantic-dark">
              Общая статистика
            </h2>
            <Sparkles size={24} className="text-romantic-gold" />
          </div>
          <hr className="golden-divider max-w-md mx-auto" />
        </div>
        <EmptyState
          icon={<BarChart3 size={48} />}
          title="Нет данных"
          description="Добавь истории и наряды, чтобы увидеть статистику"
          action={{
            label: 'Добавить историю',
            onClick: () => navigate('/'),
            icon: <Sparkles size={18} />,
          }}
        />
      </div>
    )
  }

  // Сортировка историй
  const sortedStories = [...(overallStats.storiesBreakdown || [])].sort((a, b) => {
    switch (sortBy) {
      case 'percentage':
        return b.percentage - a.percentage
      case 'title':
        return a.storyTitle.localeCompare(b.storyTitle, 'ru')
      case 'items':
        return b.ownedItems - a.ownedItems
      default:
        return 0
    }
  })

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Sparkles size={24} className="text-romantic-gold" />
          <h2 className="font-cormorant text-3xl font-bold text-romantic-dark">
            Общая статистика
          </h2>
          <Sparkles size={24} className="text-romantic-gold" />
        </div>
        <hr className="golden-divider max-w-md mx-auto" />
        <p className="text-romantic-gold/70 font-nunito text-sm">
          Твой прогресс по всем историям Клуба Романтики
        </p>
      </div>

      {/* Карточки статистики */}
      <StatsSummary
        totalStories={overallStats.totalStories}
        completedStories={overallStats.completedStories}
        totalItems={overallStats.totalItems}
        ownedItems={overallStats.ownedItems}
        overallPercentage={overallStats.overallPercentage}
        totalDiamondsSpent={overallStats.totalDiamondsSpent}
        totalStatsSpent={overallStats.totalStatsSpent}
        wishlistItems={overallStats.wishlistItems}
      />

      {/* Общий прогресс */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="romantic-card rounded-2xl p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cormorant text-xl font-bold text-romantic-dark flex items-center gap-2">
            <TrendingUp size={22} className="text-romantic-gold" />
            Общий прогресс гардероба
          </h3>
          <motion.span
            key={overallStats.overallPercentage}
            initial={{ scale: 1.3, color: '#d4a574' }}
            animate={{ scale: 1, color: '#2d1b4e' }}
            className="text-3xl font-cormorant font-bold text-romantic-gold"
          >
            {overallStats.overallPercentage}%
          </motion.span>
        </div>
        <ProgressBar
          value={overallStats.overallPercentage}
          size="lg"
          showPercentage={false}
        />
        <p className="text-xs text-romantic-dark/40 font-nunito mt-3 text-center">
          👗 {overallStats.ownedItems} из {overallStats.totalItems} нарядов собрано
          {overallStats.totalDiamondsSpent > 0 && (
            <> • 💎 {overallStats.totalDiamondsSpent.toLocaleString()} алмазов потрачено</>
          )}
        </p>
      </motion.div>

      {/* Прогресс по историям */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-cormorant text-xl font-bold text-romantic-dark flex items-center gap-2">
            📚 Прогресс по историям
          </h3>

          {/* Сортировка */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-romantic-dark/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs font-nunito bg-romantic-pink/30 border border-romantic-gold/20 
                         rounded-xl px-3 py-1.5 text-romantic-dark focus:outline-none
                         focus:border-romantic-gold cursor-pointer"
            >
              <option value="percentage">По прогрессу</option>
              <option value="title">По названию</option>
              <option value="items">По собрано</option>
            </select>
          </div>
        </div>

        {/* Список историй с прогрессом */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedStories.map((item, index) => (
              <motion.div
                key={item.storyId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => navigate(`/story/${item.storyId}`)}
                className="romantic-card rounded-2xl p-4 shadow-card cursor-pointer
                           hover:shadow-card-hover transform hover:-translate-y-0.5
                           transition-all duration-200 group active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-romantic-pink/50 flex items-center justify-center
                                  text-xl flex-shrink-0">
                    📖
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-cormorant font-semibold text-romantic-dark truncate">
                        {item.storyTitle}
                      </h4>
                      <span className="text-sm font-nunito font-bold text-romantic-gold ml-2">
                        {item.percentage}%
                      </span>
                    </div>
                    <ProgressBar
                      value={item.percentage}
                      size="sm"
                      showPercentage={false}
                      color={item.percentage === 100 ? 'emerald' : 'gold'}
                    />
                    <p className="text-xs text-romantic-dark/40 font-nunito mt-1">
                      {item.ownedItems} / {item.totalItems} нарядов
                    </p>
                  </div>

                  <ChevronRight
                    size={20}
                    className="text-romantic-gold/30 group-hover:text-romantic-gold 
                               group-hover:translate-x-1 transition-all flex-shrink-0"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}