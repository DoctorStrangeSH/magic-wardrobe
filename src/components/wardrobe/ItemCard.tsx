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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowDeleteConfirm(false)
          setShowMenu(false)
        }}
        whileHover={{ scale: 1.01 }}
        onClick={handleCardClick}
        className={`
          group relative romantic-card rounded-2xl overflow-hidden
          shadow-card hover:shadow-lg cursor-pointer
          transition-shadow duration-200
          ${item.isOwned ? 'ring-1 ring-romantic-gold/30' : ''}
        `}
      >
        {/* Эффект мерцания для алмазных */}
        {!item.isFree && !item.isOwned && <ShimmerEffect />}

        {/* Изображение */}
        <div className="relative w-full bg-gradient-to-br from-romantic-pink/30 to-romantic-dark/3 
                        flex items-center justify-center overflow-hidden">
          {item.image ? (
            <div className="w-full" style={{ maxHeight: '260px' }}>
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-auto max-h-[260px] object-contain transition-transform duration-300
                           group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="py-10 text-center">
              <span className="text-4xl opacity-70">
                {item.category === 'dress' ? '👗' :
                 item.category === 'hairstyle' ? '💇‍♀️' :
                 item.category === 'accessory' ? '💍' : '💄'}
              </span>
            </div>
          )}

          {/* Бейдж "Особые условия" */}
          {!item.isOwned && hasSpecialCondition && (
            <div className="absolute top-2 left-2 z-10">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full 
                              bg-gradient-to-r from-amber-400 to-orange-500 
                              text-white text-[10px] font-nunito font-bold shadow-md">
                <Star size={10} className="fill-white" />
                Особые условия
              </div>
            </div>
          )}

          {/* Кнопка меню */}
          <div className="absolute top-2 right-2 z-10" data-no-detail>
            <button
              onClick={handleMenuToggle}
              className="w-7 h-7 rounded-lg bg-white/85 backdrop-blur-sm 
                         flex items-center justify-center
                         text-romantic-dark/50 hover:text-romantic-dark 
                         hover:bg-white transition-all shadow-sm"
            >
              <MoreVertical size={14} />
            </button>
          </div>

          {/* Меню */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-10 right-2 z-20 bg-white/95 backdrop-blur-md 
                           rounded-xl shadow-lg border border-romantic-gold/20 
                           overflow-hidden min-w-[130px]"
                onClick={(e) => e.stopPropagation()}
                data-no-detail
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDetail(true); setShowMenu(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-nunito
                             text-romantic-dark/70 hover:bg-romantic-pink/30 border-b border-romantic-pink/30"
                >
                  <Eye size={14} /> Подробнее
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-nunito
                             text-romantic-dark/70 hover:bg-romantic-pink/30 border-b border-romantic-pink/30"
                >
                  <Edit3 size={14} /> Редактировать
                </button>
                {!showDeleteConfirm ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true) }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-nunito
                               text-romantic-dark/70 hover:bg-red-50 hover:text-romantic-crimson"
                  >
                    <Trash2 size={14} /> Удалить
                  </button>
                ) : (
                  <div className="p-2 space-y-1.5 bg-red-50">
                    <p className="text-[10px] text-center">Удалить?</p>
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={handleDelete} className="px-2.5 py-1 rounded-md bg-romantic-crimson text-white text-[10px] font-bold">Да</button>
                      <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false) }} className="px-2.5 py-1 rounded-md bg-white text-[10px]">Нет</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Информация */}
        <div className="p-2.5 space-y-1.5">
          <h4 className="font-cormorant font-semibold text-romantic-dark text-sm leading-tight line-clamp-2">
            {item.name}
          </h4>

          <p className="text-[10px] text-romantic-dark/40 font-nunito">
            Сезон {item.season}, Серия {item.episode}
          </p>

          <div className="flex items-center justify-between">
            {item.isFree ? (
              <Badge variant="free" icon={<span>🆓</span>}>Бесплатно</Badge>
            ) : (
              <Badge variant="diamond" icon={<Diamond size={10} />}>{item.diamondCost} 💎</Badge>
            )}

            <div onClick={handleToggleOwned} data-no-detail className="cursor-pointer z-10 p-1 -m-1">
              <Checkbox checked={item.isOwned} onChange={() => {}} />
            </div>
          </div>
        </div>
      </motion.article>

      <SparkleEffect isActive={showSparkle} x={sparklePos.x} y={sparklePos.y} count={8} />

      <ItemDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        item={item}
        onToggleOwned={() => handleToggleOwned({} as React.MouseEvent)}
      />
    </>
  )
}