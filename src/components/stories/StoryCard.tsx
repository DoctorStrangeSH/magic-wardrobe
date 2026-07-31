import { motion } from 'framer-motion'
import { Play, CheckCircle2, PauseCircle } from 'lucide-react'
import type { Story } from '../../core/types/wardrobe'
import MagicGlow from '../effects/MagicGlow'

interface StoryCardProps {
  story: Story
  progress?: number
  onClick?: () => void
}

const statusConfig = {
  playing: {
    icon: Play,
    label: 'Прохожу',
    color: 'text-emerald-500 bg-emerald-50',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Пройдена',
    color: 'text-romantic-gold bg-romantic-gold/10',
  },
  paused: {
    icon: PauseCircle,
    label: 'Пауза',
    color: 'text-slate-500 bg-slate-50',
  },
}

export default function StoryCard({ story, progress = 0, onClick }: StoryCardProps) {
  const status = statusConfig[story.status]
  const StatusIcon = status.icon

  return (
    <motion.article
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="
        group relative romantic-card rounded-2xl overflow-hidden
        shadow-card hover:shadow-card-hover
        cursor-pointer
      "
    >
      {/* Магическое свечение для пройденных историй */}
      {story.status === 'completed' && (
        <MagicGlow isActive color="#d4a574" size={80} className="-top-4 -right-4" />
      )}

      {/* Обложка */}
      <div className="aspect-[3/4] bg-gradient-to-br from-romantic-pink to-romantic-dark/10 
                      flex items-center justify-center overflow-hidden relative">
        {story.cover ? (
          <motion.img
            src={story.cover}
            alt={story.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <motion.div
            className="text-center p-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-romantic-gold/20 
                            flex items-center justify-center">
              <span className="text-3xl font-cormorant text-romantic-gold/60">
                {story.title.charAt(0)}
              </span>
            </div>
            <p className="text-romantic-dark/40 font-cormorant text-sm italic">
              Загрузи обложку
            </p>
          </motion.div>
        )}

        {/* Декоративный уголок */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-6 bg-romantic-gold/20 backdrop-blur-sm rounded-full 
                       flex items-center justify-center"
          >
            <span className="text-romantic-gold text-xs">✦</span>
          </motion.div>
        </div>
      </div>

      {/* Информация */}
      <div className="p-4 space-y-3">
        {/* Название */}
        <h3 className="font-cormorant text-lg font-semibold text-romantic-dark 
                       group-hover:text-romantic-crimson transition-colors truncate">
          {story.title}
        </h3>

        {/* Статус */}
        <div className="flex items-center justify-between">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-nunito font-medium
              ${status.color}
            `}
          >
            <StatusIcon size={14} />
            {status.label}
          </motion.span>
          <span className="text-xs text-romantic-dark/40 font-nunito">
            {story.totalSeasons} сез.
          </span>
        </div>

        {/* Прогресс-бар с анимацией */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-nunito">
            <span className="text-romantic-dark/50">Гардероб</span>
            <motion.span
              key={progress}
              initial={{ scale: 1.3, color: '#d4a574' }}
              animate={{ scale: 1, color: '#2d1b4e' }}
              className="text-romantic-gold font-semibold"
            >
              {progress}%
            </motion.span>
          </div>
          <div className="w-full h-2 bg-romantic-pink/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-romantic-gold to-romantic-lightGold 
                         rounded-full relative"
            >
              {/* Блик */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}