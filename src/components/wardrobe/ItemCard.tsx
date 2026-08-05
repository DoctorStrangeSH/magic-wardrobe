import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Diamond, Edit3, Trash2, MoreVertical, Eye, Star } from 'lucide-react'
import type { WardrobeItem } from '../../core/types/wardrobe'
import { useWardrobeStore } from '../../store/wardrobeStore'
import Checkbox from '../ui/Checkbox'
import Badge from '../ui/Badge'
import SparkleEffect from '../effects/SparkleEffect'
import ShimmerEffect from '../effects/ShimmerEffect'
import ItemDetailModal from './ItemDetailModal'

interface ItemCardProps {
  item: WardrobeItem
  onEdit?: (item: WardrobeItem) => void
}

export default function ItemCard({ item, onEdit }: ItemCardProps) {
  const { toggleOwned, deleteItem } = useWardrobeStore()
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)
  const [sparklePos, setSparklePos] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleToggleOwned = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setSparklePos({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
    
    setShowSparkle(true)
    setTimeout(() => setShowSparkle(false), 1000)
    await toggleOwned(item.id)
  }

  const handleDelete = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowMenu(false)
    await deleteItem(item.id)
  }

  const handleEdit = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowMenu(false)
    onEdit?.(item)
  }

  const handleShowDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowDeleteConfirm(true)
  }

  const handleCancelDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowDeleteConfirm(false)
  }

  const handleMenuToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowMenu(!showMenu)
    setShowDeleteConfirm(false)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('label') ||
      target.closest('[data-no-detail]')
    ) {
      return
    }
    setShowDetail(true)
  }

  const hasSpecialCondition = item.notes && item.notes.trim().length > 0

  return (
    <>
      <motion.article
        ref={cardRef}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: item.isOwned 
            ? '0 8px 25px rgba(212, 167, 116, 0.15), 0 0 20px rgba(212, 167, 116, 0.08)' 
            : '0 2px 12px rgba(45, 27, 78, 0.06)',
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowDeleteConfirm(false)
          setShowMenu(false)
        }}
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={handleCardClick}
        className={`
          group relative romantic-card rounded-2xl overflow-hidden
          shadow-card hover:shadow-xl cursor-pointer
          transition-shadow duration-300
          ${item.isOwned ? 'ring-1 ring-romantic-gold/30' : ''}
        `}
      >
        {/* Эффект мерцания для алмазных нарядов */}
        {!item.isFree && !item.isOwned && <ShimmerEffect />}

        {/* Изображение */}
        <div className="relative w-full bg-gradient-to-br from-romantic-pink/30 to-romantic-dark/3 
                        flex items-center justify-center overflow-hidden">
          {item.image ? (
            <div className="w-full" style={{ maxHeight: '260px' }}>
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-auto max-h-[260px] object-contain transition-all duration-500
                           group-hover:scale-105"
              />
            </div>
          ) : (
            <motion.div
              className="py-10 text-center"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-5xl opacity-80">
                {item.category === 'dress' ? '👗' :
                 item.category === 'hairstyle' ? '💇‍♀️' :
                 item.category === 'accessory' ? '💍' : '💄'}
              </span>
            </motion.div>
          )}

          {/* Кнопка просмотра (десктоп) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered && !showMenu ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-romantic-darker/60 via-transparent to-transparent 
                       hidden sm:flex items-end justify-center pb-4 pointer-events-none"
          >
            <span className="px-4 py-2 rounded-xl bg-white/95 text-romantic-dark font-nunito text-xs
                           flex items-center gap-2 shadow-lg font-medium">
              <Eye size={14} />
              Подробнее
            </span>
          </motion.div>

          {/* Бейдж "Особые условия" */}
          {!item.isOwned && hasSpecialCondition && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute top-2 left-2"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full 
                              bg-gradient-to-r from-amber-400 to-orange-500 
                              text-white text-[11px] font-nunito font-bold shadow-lg
                              border border-amber-300/50 backdrop-blur-sm">
                <Star size={11} className="fill-white" />
                Особые условия
              </div>
            </motion.div>
          )}

          {/* Кнопка меню */}
          <div className="absolute top-2 right-2" data-no-detail>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isHovered || showMenu ? 1 : 0,
                scale: isHovered || showMenu ? 1 : 0.8
              }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMenuToggle}
              className="w-8 h-8 rounded-xl bg-white/85 backdrop-blur-sm 
                         flex items-center justify-center
                         text-romantic-dark/60 hover:text-romantic-dark 
                         hover:bg-white transition-all shadow-md"
            >
              <MoreVertical size={15} />
            </motion.button>
          </div>

          {/* Выпадающее меню */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                className="absolute top-12 right-2 z-20 bg-white/95 backdrop-blur-md 
                           rounded-2xl shadow-xl border border-romantic-gold/20 
                           overflow-hidden min-w-[150px]"
                onClick={(e) => e.stopPropagation()}
                data-no-detail
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setShowDetail(true)
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-nunito
                             text-romantic-dark/70 hover:bg-romantic-pink/30 transition-colors
                             border-b border-romantic-pink/30"
                >
                  <Eye size={16} />
                  Подробнее
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-nunito
                             text-romantic-dark/70 hover:bg-romantic-pink/30 
                             hover:text-romantic-gold transition-colors
                             border-b border-romantic-pink/30"
                >
                  <Edit3 size={16} />
                  Редактировать
                </button>
                {!showDeleteConfirm ? (
                  <button
                    onClick={handleShowDelete}
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
                      Удалить наряд?
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
                        onClick={handleCancelDelete}
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
        </div>

        {/* Информация */}
        <div className="p-3 space-y-2">
          <h4 className="font-cormorant font-semibold text-romantic-dark text-sm leading-tight line-clamp-2">
            {item.name}
          </h4>

          <p className="text-[11px] text-romantic-dark/40 font-nunito font-medium">
            Сезон {item.season}, Серия {item.episode}
          </p>

          <div className="flex items-center justify-between">
            {item.isFree ? (
              <Badge variant="free" icon={<span>🆓</span>}>
                Бесплатно
              </Badge>
            ) : (
              <Badge variant="diamond" icon={<Diamond size={11} />}>
                {item.diamondCost} 💎
              </Badge>
            )}

            {/* Галочка "У меня есть" */}
            <motion.div 
              onClick={handleToggleOwned}
              data-no-detail
              className="cursor-pointer z-10 p-1 -m-1"
              whileTap={{ scale: 0.85 }}
            >
              <Checkbox
                checked={item.isOwned}
                onChange={() => {}}
              />
            </motion.div>
          </div>
        </div>

        {/* Магическое свечение для собранных нарядов */}
        {item.isOwned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -inset-1 rounded-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(212,167,116,0.08) 0%, transparent 70%)',
            }}
          />
        )}
      </motion.article>

      {/* Эффект звёздочек */}
      <SparkleEffect isActive={showSparkle} x={sparklePos.x} y={sparklePos.y} count={12} />

      {/* Модальное окно с деталями наряда */}
      <ItemDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        item={item}
        onToggleOwned={() => handleToggleOwned({} as React.MouseEvent)}
      />
    </>
  )
}