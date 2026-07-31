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
            ? '0 4px 20px rgba(212, 167, 116, 0.2), 0 0 15px rgba(212, 167, 116, 0.1)' 
            : '0 2px 12px rgba(45, 27, 78, 0.08)',
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowDeleteConfirm(false)
          setShowMenu(false)
        }}
        whileHover={{ scale: 1.02 }}
        onClick={handleCardClick}
        className={`
          group relative romantic-card rounded-2xl overflow-hidden
          shadow-card hover:shadow-card-hover cursor-pointer
          transition-shadow duration-300
          ${item.isOwned ? 'ring-1 ring-romantic-gold/40' : ''}
        `}
      >
        {/* Эффект мерцания для алмазных нарядов */}
        {!item.isFree && !item.isOwned && <ShimmerEffect />}

        {/* Изображение */}
        <div className="relative w-full bg-gradient-to-br from-romantic-pink/50 to-romantic-dark/5 
                        flex items-center justify-center overflow-hidden">
          {item.image ? (
            <div className="w-full" style={{ maxHeight: '280px' }}>
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-auto max-h-[280px] object-contain transition-all duration-500"
              />
            </div>
          ) : (
            <div className="py-8 text-center transition-all duration-500">
              <span className="text-5xl">
                {item.category === 'dress' ? '👗' :
                 item.category === 'hairstyle' ? '💇‍♀️' :
                 item.category === 'accessory' ? '💍' : '💄'}
              </span>
            </div>
          )}

          {/* Кнопка просмотра (десктоп) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered && !showMenu ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-romantic-darker/50 to-transparent 
                       hidden sm:flex items-center justify-center pointer-events-none"
          >
            <span className="px-4 py-2 rounded-xl bg-white/90 text-romantic-dark font-nunito text-sm
                           flex items-center gap-2 shadow-lg">
              <Eye size={16} />
              Подробнее
            </span>
          </motion.div>

          {/* Бейдж "Особые условия" */}
          {!item.isOwned && hasSpecialCondition && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                              bg-gradient-to-r from-amber-400 to-orange-400 
                              text-white text-xs font-nunito font-bold shadow-lg
                              border border-amber-300/50">
                <Star size={12} className="fill-white" />
                Особые условия
              </div>
            </motion.div>
          )}

          {/* Кнопка меню */}
          <div className="absolute top-2 right-2" data-no-detail>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleMenuToggle}
              className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm 
                         flex items-center justify-center
                         text-romantic-dark/70 hover:bg-white transition-colors shadow-sm"
            >
              <MoreVertical size={16} />
            </motion.button>
          </div>

          {/* Выпадающее меню */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -5 }}
                className="absolute top-12 right-2 z-20 bg-white/95 backdrop-blur-sm 
                           rounded-2xl shadow-lg border border-romantic-gold/20 overflow-hidden min-w-[140px]"
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
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm font-nunito
                             text-romantic-dark/70 hover:bg-romantic-pink/30 transition-colors
                             border-b border-romantic-pink/30"
                >
                  <Eye size={16} />
                  Подробнее
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm font-nunito
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
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm font-nunito
                               text-romantic-dark/70 hover:bg-red-50 
                               hover:text-romantic-crimson transition-colors"
                  >
                    <Trash2 size={16} />
                    Удалить
                  </button>
                ) : (
                  <div className="p-3 space-y-2 bg-red-50/50">
                    <p className="text-xs text-romantic-dark/70 font-nunito text-center">
                      Удалить наряд?
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={handleDelete}
                        className="px-3 py-1.5 rounded-lg bg-romantic-crimson text-white text-xs font-bold"
                      >
                        Да
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        className="px-3 py-1.5 rounded-lg bg-white/80 text-romantic-dark text-xs"
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

          <p className="text-xs text-romantic-dark/50 font-nunito">
            Сезон {item.season}, Серия {item.episode}
          </p>

          <div className="flex items-center justify-between">
            {item.isFree ? (
              <Badge variant="free" icon={<span>🆓</span>}>
                Бесплатно
              </Badge>
            ) : (
              <Badge variant="diamond" icon={<Diamond size={12} />}>
                {item.diamondCost} 💎
              </Badge>
            )}

            {/* Галочка "У меня есть" */}
            <div 
              onClick={handleToggleOwned}
              data-no-detail
              className="cursor-pointer z-10 p-1 -m-1"
            >
              <Checkbox
                checked={item.isOwned}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Магическое свечение для собранных нарядов */}
        {item.isOwned && (
          <div 
            className="absolute -inset-1 rounded-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(212,167,116,0.1) 0%, transparent 70%)',
            }}
          />
        )}
      </motion.article>

      {/* Эффект звёздочек */}
      <SparkleEffect isActive={showSparkle} x={sparklePos.x} y={sparklePos.y} count={10} />

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