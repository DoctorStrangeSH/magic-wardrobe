import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, CheckCircle2, PauseCircle, Edit3, Trash2, MoreVertical } from 'lucide-react'
import type { Story } from '../../core/types/wardrobe'
import { useWardrobeStore } from '../../store/wardrobeStore'


interface StoryCardProps {
  story: Story
  progress?: number
  onClick?: () => void
  onEdit?: () => void
}

const statusConfig = {
  playing: {
    icon: Play,
    label: 'Прохожу',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Пройдена',
    gradient: 'from-romantic-gold to-amber-500',
    bg: 'bg-romantic-gold/10',
  },
  paused: {
    icon: PauseCircle,
    label: 'Пауза',
    gradient: 'from-slate-400 to-slate-500',
    bg: 'bg-slate-50',
  },
}

export default function StoryCard({ story, progress = 0, onClick, onEdit }: StoryCardProps) {
  const { deleteStory } = useWardrobeStore()
  const status = statusConfig[story.status]
  const StatusIcon = status.icon
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowMenu(false)
    await deleteStory(story.id)
  }

  const handleEdit = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowMenu(false)
    onEdit?.()
  }

  return (
    <motion.article
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowMenu(false)
        setShowDeleteConfirm(false)
      }}
      className="group relative romantic-card rounded-2xl overflow-hidden shadow-card 
                 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    >
      {/* Обложка */}
      <div className="aspect-[3/4] bg-gradient-to-br from-romantic-pink/30 to-romantic-dark/5 
                      flex items-center justify-center overflow-hidden relative">
        {story.cover ? (
          <img
            src={story.cover}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <motion.div
            className="text-center p-4"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-romantic-gold/10 
                            flex items-center justify-center backdrop-blur-sm
                            border border-romantic-gold/20">
              <span className="text-4xl font-cormorant text-romantic-gold/40">
                {story.title.charAt(0)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Градиент при наведении */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-romantic-darker/70 via-romantic-darker/20 to-transparent"
        />

        {/* Кнопка меню */}
        <div className="absolute top-3 right-3 z-10">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isHovered || showMenu ? 1 : 0,
              scale: isHovered || showMenu ? 1 : 0.8
            }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
              setShowDeleteConfirm(false)
            }}
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm 
                       flex items-center justify-center
                       text-romantic-dark/70 hover:text-romantic-dark 
                       hover:bg-white transition-all shadow-lg"
          >
            <MoreVertical size={17} />
          </motion.button>
        </div>

        {/* Выпадающее меню */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              className="absolute top-14 right-3 z-20 bg-white/95 backdrop-blur-md 
                         rounded-2xl shadow-xl border border-romantic-gold/20 
                         overflow-hidden min-w-[150px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleEdit}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-nunito
                           text-romantic-dark/70 hover:bg-romantic-pink/30 
                           hover:text-romantic-gold transition-colors"
              >
                <Edit3 size={16} />
                Редактировать
              </button>
              {!showDeleteConfirm ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(true)
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-nunito
                             text-romantic-dark/70 hover:bg-red-50 
                             hover:text-romantic-crimson transition-colors"
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              ) : (
                <div className="p-3 space-y-2 bg-red-50">
                  <p className="text-xs text-romantic-dark/70 font-nunito text-center">
                    Удалить историю?
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 rounded-lg bg-romantic-crimson text-white text-xs font-bold
                                 hover:bg-red-700 transition-colors"
                    >
                      Да
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteConfirm(false)
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white text-romantic-dark text-xs
                                 hover:bg-gray-100 transition-colors"
                    >
                      Нет
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Прогресс на обложке */}
        {progress > 0 && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className={`h-full bg-gradient-to-r ${status.gradient} rounded-full`}
                />
              </div>
              <span className="text-xs font-nunito font-bold text-white drop-shadow-md">
                {progress}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="p-4 space-y-3">
        <h3 className="font-cormorant text-lg font-bold text-romantic-dark 
                       group-hover:text-romantic-crimson transition-colors truncate">
          {story.title}
        </h3>

        <div className="flex items-center justify-between">
          <span className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-nunito font-semibold
            ${status.bg} text-romantic-dark/80
          `}>
            <StatusIcon size={14} />
            {status.label}
          </span>
          <span className="text-xs text-romantic-dark/40 font-nunito font-medium">
            {story.totalSeasons} сез.
          </span>
        </div>
      </div>

      {/* Декоративный блик */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-romantic-gold/5 rounded-full 
                      blur-2xl group-hover:bg-romantic-gold/10 transition-colors pointer-events-none" />
    </motion.article>
  )
}