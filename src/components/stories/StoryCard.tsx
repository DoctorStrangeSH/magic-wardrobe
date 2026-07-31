import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, CheckCircle2, PauseCircle, Edit3, Trash2, MoreVertical } from 'lucide-react'
import type { Story } from '../../core/types/wardrobe'
import MagicGlow from '../effects/MagicGlow'
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

export default function StoryCard({ story, progress = 0, onClick, onEdit }: StoryCardProps) {
  const { deleteStory } = useWardrobeStore()
  const status = statusConfig[story.status]
  const StatusIcon = status.icon
  
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Для долгого нажатия на мобильных
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTouchDevice = useRef(false)

  const handleDelete = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    await deleteStory(story.id)
  }

  const handleEdit = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowMenu(false)
    onEdit?.()
  }

  const handleShowDeleteConfirm = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowDeleteConfirm(true)
    setShowMenu(false)
  }

  const handleCancelDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowDeleteConfirm(false)
  }

  // Долгое нажатие для мобильных
  const handleTouchStart = useCallback(() => {
    isTouchDevice.current = true
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true)
    }, 500) // 500ms долгое нажатие
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  // Клик по карточке
  const handleCardClick = () => {
    if (showMenu || showDeleteConfirm) {
      setShowMenu(false)
      setShowDeleteConfirm(false)
      return
    }
    onClick?.()
  }

  // Закрыть меню при клике вне карточки
  const handleBlur = () => {
    setShowMenu(false)
    setShowDeleteConfirm(false)
  }

  return (
    <motion.article
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onMouseEnter={() => {
        if (!isTouchDevice.current) setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowDeleteConfirm(false)
        if (!isTouchDevice.current) setShowMenu(false)
      }}
      tabIndex={0}
      onBlur={handleBlur}
      className="
        group relative romantic-card rounded-2xl overflow-hidden
        shadow-card hover:shadow-card-hover
        cursor-pointer outline-none
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

        {/* Десктоп: кнопки при наведении */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered && !showMenu ? 1 : 0 }}
          className="absolute top-2 right-2 gap-1.5 hidden sm:flex"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm 
                       flex items-center justify-center
                       text-romantic-dark/60 hover:text-romantic-gold 
                       hover:bg-white transition-colors shadow-sm"
            title="Редактировать"
          >
            <Edit3 size={15} />
          </motion.button>

          {!showDeleteConfirm ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteConfirm(true)
              }}
              className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm 
                         flex items-center justify-center
                         text-romantic-dark/60 hover:text-romantic-crimson 
                         hover:bg-white transition-colors shadow-sm"
              title="Удалить"
            >
              <Trash2 size={15} />
            </motion.button>
          ) : (
            <div className="flex gap-1">
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleDelete}
                className="px-2.5 py-1 rounded-lg bg-romantic-crimson text-white text-xs font-bold"
              >
                Удалить
              </motion.button>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleCancelDelete}
                className="px-2.5 py-1 rounded-lg bg-white/80 text-romantic-dark text-xs"
              >
                Нет
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Мобильное меню (три точки) */}
        <div className="absolute top-2 right-2 sm:hidden">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
              setShowDeleteConfirm(false)
            }}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm 
                       flex items-center justify-center
                       text-romantic-dark/70 hover:bg-white transition-colors shadow-sm"
          >
            <MoreVertical size={16} />
          </motion.button>
        </div>

        {/* Мобильное выпадающее меню */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute top-12 right-2 z-20 bg-white/95 backdrop-blur-sm 
                       rounded-2xl shadow-lg border border-romantic-gold/20 
                       overflow-hidden sm:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm font-nunito
                         text-romantic-dark/70 hover:bg-romantic-pink/30 
                         hover:text-romantic-gold transition-colors"
            >
              <Edit3 size={16} />
              Редактировать
            </button>
            {!showDeleteConfirm ? (
              <button
                onClick={handleShowDeleteConfirm}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm font-nunito
                           text-romantic-dark/70 hover:bg-red-50 
                           hover:text-romantic-crimson transition-colors"
              >
                <Trash2 size={16} />
                Удалить
              </button>
            ) : (
              <div className="p-3 space-y-2">
                <p className="text-xs text-romantic-dark/70 font-nunito text-center">
                  Удалить историю?
                </p>
                <div className="flex gap-2 justify-center">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-lg bg-romantic-crimson text-white text-xs font-bold"
                  >
                    Да
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCancelDelete}
                    className="px-3 py-1.5 rounded-lg bg-romantic-pink/50 text-romantic-dark text-xs"
                  >
                    Нет
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Информация */}
      <div className="p-4 space-y-3">
        <h3 className="font-cormorant text-lg font-semibold text-romantic-dark 
                       group-hover:text-romantic-crimson transition-colors truncate">
          {story.title}
        </h3>

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

        {/* Прогресс-бар */}
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
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}