import { motion } from 'framer-motion'
import { Diamond, ShoppingBag, BookOpen, Trophy, Heart } from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  delay?: number
}

function StatCard({ icon, label, value, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`
        romantic-card rounded-2xl p-5 shadow-card
        border-l-4 ${color}
        flex items-center gap-4
        hover:shadow-card-hover transition-shadow
      `}
    >
      <div className="p-3 rounded-xl bg-white/50">{icon}</div>
      <div>
        <p className="text-xs font-nunito text-romantic-dark/50 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-cormorant font-bold text-romantic-dark">
          {value}
        </p>
      </div>
    </motion.div>
  )
}

interface StatsSummaryProps {
  totalStories: number
  completedStories: number
  totalItems: number
  ownedItems: number
  overallPercentage: number
  totalDiamondsSpent: number
  wishlistItems: number
}

export default function StatsSummary({
  totalStories,
  completedStories,
  totalItems,
  ownedItems,
  overallPercentage,
  totalDiamondsSpent,
  wishlistItems,
}: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Всего историй */}
      <StatCard
        icon={<BookOpen size={24} className="text-purple-500" />}
        label="Всего историй"
        value={`${totalStories} (${completedStories} пройдено)`}
        color="border-purple-400"
        delay={0}
      />

      {/* Прогресс гардероба */}
      <StatCard
        icon={<Trophy size={24} className="text-romantic-gold" />}
        label="Общий прогресс"
        value={`${overallPercentage}%`}
        color="border-romantic-gold"
        delay={0.1}
      />

      {/* Собрано нарядов */}
      <StatCard
        icon={<ShoppingBag size={24} className="text-emerald-500" />}
        label="Собрано нарядов"
        value={`${ownedItems} / ${totalItems}`}
        color="border-emerald-400"
        delay={0.2}
      />

      {/* Потрачено алмазов */}
      <StatCard
        icon={<Diamond size={24} className="text-blue-500" />}
        label="Потрачено алмазов"
        value={totalDiamondsSpent.toLocaleString()}
        color="border-blue-400"
        delay={0.3}
      />

      {/* Хочу получить */}
      <StatCard
        icon={<Heart size={24} className="text-romantic-crimson" />}
        label="Хочу получить"
        value={wishlistItems}
        color="border-romantic-crimson"
        delay={0.4}
      />

      {/* Средний процент */}
      <StatCard
        icon={<span className="text-2xl">📊</span>}
        label="Средний прогресс"
        value={totalStories > 0 
          ? `${Math.round(overallPercentage)}%` 
          : '0%'}
        color="border-pink-400"
        delay={0.5}
      />
    </div>
  )
}