import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Diamond, Heart, Edit3, Trash2 } from 'lucide-react'
import type { WardrobeItem } from '../../core/types/wardrobe'
import { useWardrobeStore } from '../../store/wardrobeStore'
import Checkbox from '../ui/Checkbox'
import Badge from '../ui/Badge'
import SparkleEffect from '../effects/SparkleEffect'
import ShimmerEffect from '../effects/ShimmerEffect'

interface ItemCardProps {
  item: WardrobeItem
}

export default function ItemCard({ item }: ItemCardProps) {
  const { toggleOwned, toggleWishlist, deleteItem } = useWardrobeStore()
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)
  const [sparklePos, setSparklePos] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleToggleOwned = async (e?: React.MouseEvent) => {
    if (e) {
      // Получаем позицию для эффекта
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      setSparklePos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }
    setShowSparkle(true)
    setTimeout(() => setShowSparkle(false), 1000)
    await toggleOwned(item.id)
  }

  const handleToggleWishlist = async () => {
    await toggleWishlist(item.id)
  }

  const handleDelete = async () => {
    await deleteItem(item.id)
  }

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
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          group relative romantic-card rounded-2xl overflow-hidden
          shadow-card hover:shadow-card-hover
          transition-shadow duration-300
          ${item.isOwned ? 'ring-1 ring-romantic-gold/40' : ''}
        `}
      >
        {/* Эффект мерцания для алмазных нарядов */}
        {!item.isFree && <ShimmerEffect />}

        {/* Изображение */}
        <div className="aspect-[3/4] bg-gradient-to-br from-romantic-pink/50 to-romantic-dark/5 
                        flex items-center justify-center overflow-hidden relative">
          {item.image ? (
            <motion.img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.div
              className="text-center p-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-5xl">
                {item.category === 'dress' ? '👗' :
                 item.category === 'hairstyle' ? '💇‍♀️' :
                 item.category === 'accessory' ? '💍' : '💄'}
              </span>
            </motion.div>
          )}

          {/* Оверлей при наведении */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-romantic-darker/60 via-romantic-darker/20 to-transparent 
                       flex items-center justify-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                item.isWishlist
                  ? 'bg-romantic-crimson text-white'
                  : 'bg-white/70 text-romantic-dark/60 hover:text-romantic-crimson'
              }`}
              title={item.isWishlist ? 'Убрать из избранного' : 'Хочу получить'}
            >
              <Heart size={18} fill={item.isWishlist ? 'white' : 'none'} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/70 text-romantic-dark/60 
                         hover:text-romantic-gold backdrop-blur-sm transition-colors"
              title="Редактировать"
            >
              <Edit3 size={18} />
            </motion.button>
            {!showDeleteConfirm ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-full bg-white/70 text-romantic-dark/60 
                           hover:text-romantic-crimson backdrop-blur-sm transition-colors"
                title="Удалить"
              >
                <Trash2 size={18} />
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex gap-1"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-xl bg-romantic-crimson text-white text-xs font-bold"
                >
                  Удалить
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/70 text-romantic-dark text-xs"
                >
                  Нет
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Бейдж "Есть" */}
          {item.isOwned && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute top-2 left-2"
            >
              <Badge variant="gold" icon={<span>✅</span>}>
                Есть
              </Badge>
            </motion.div>
          )}

          {/* Бейдж "Хочу" */}
          {item.isWishlist && !item.isOwned && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute top-2 left-2"
            >
              <Badge variant="crimson" icon={<Heart size={12} />}>
                Хочу
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Информация */}
        <div className="p-3 space-y-2 relative">
          {/* Название */}
          <h4 className="font-cormorant font-semibold text-romantic-dark text-sm leading-tight line-clamp-2">
            {item.name}
          </h4>

          {/* Серия */}
          <p className="text-xs text-romantic-dark/50 font-nunito">
            С{item.season} С{item.episode}
          </p>

          {/* Нижняя строка: тип и чекбокс */}
          <div className="flex items-center justify-between">
            {/* Тип наряда */}
            {item.isFree ? (
              <Badge variant="free" icon={<span>🆓</span>}>
                Бесплатно
              </Badge>
            ) : (
              <Badge variant="diamond" icon={<Diamond size={12} />}>
                {item.diamondCost}
              </Badge>
            )}

            {/* Чекбокс владения с эффектом */}
            <motion.div
              whileTap={{ scale: 0.8 }}
              animate={item.isOwned ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Checkbox
                checked={item.isOwned}
                onChange={() => handleToggleOwned()}
              />
            </motion.div>
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

      {/* Эффект звёздочек при отметке */}
      <SparkleEffect
        isActive={showSparkle}
        x={sparklePos.x}
        y={sparklePos.y}
        count={10}
      />
    </>
  )
}