import { motion } from 'framer-motion'
import { X, Diamond, MapPin, AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react'
import type { WardrobeItem } from '../../core/types/wardrobe'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../core/types/wardrobe'
import Checkbox from '../ui/Checkbox'
import Badge from '../ui/Badge'

interface ItemDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: WardrobeItem
  onToggleOwned: () => void
}

export default function ItemDetailModal({ isOpen, onClose, item, onToggleOwned }: ItemDetailModalProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-romantic-darker/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto
                   romantic-card rounded-3xl shadow-magic-lg border border-romantic-gold/20"
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 
                     text-romantic-dark/60 hover:text-romantic-crimson transition-colors"
        >
          <X size={20} />
        </button>

        {/* Изображение */}
        {item.image ? (
          <div className="w-full bg-gradient-to-br from-romantic-pink/30 to-romantic-dark/5">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-auto max-h-[400px] object-contain"
            />
          </div>
        ) : (
          <div className="w-full py-16 bg-gradient-to-br from-romantic-pink/30 to-romantic-dark/5 
                          flex items-center justify-center">
            <span className="text-7xl">
              {CATEGORY_ICONS[item.category]}
            </span>
          </div>
        )}

        {/* Контент */}
        <div className="p-6 space-y-5">
          {/* Название и категория */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-cormorant text-2xl font-bold text-romantic-dark">
                {item.name}
              </h2>
              <Badge variant="default">
                {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}
              </Badge>
            </div>
          </div>

          <hr className="golden-divider" />

          {/* Основная информация */}
          <div className="grid grid-cols-2 gap-4">
            {/* Локация */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-romantic-pink/20">
              <MapPin size={20} className="text-romantic-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-romantic-dark/50 font-nunito">Где получить</p>
                <p className="font-nunito font-semibold text-romantic-dark">
                  Сезон {item.season}, Серия {item.episode}
                </p>
              </div>
            </div>

            {/* Стоимость */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-romantic-pink/20">
              {item.isFree ? (
                <ShoppingBag size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Diamond size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs text-romantic-dark/50 font-nunito">Стоимость</p>
                <p className="font-nunito font-semibold text-romantic-dark">
                  {item.isFree ? (
                    <span className="text-emerald-600">Бесплатно 🆓</span>
                  ) : (
                    <span className="text-blue-600">{item.diamondCost} 💎</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Статус владения */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-romantic-pink/20">
            <div className="flex items-center gap-3">
              {item.isOwned ? (
                <CheckCircle2 size={24} className="text-emerald-500" />
              ) : (
                <AlertCircle size={24} className="text-romantic-gold/50" />
              )}
              <span className="font-nunito text-sm text-romantic-dark">
                {item.isOwned ? 'Наряд получен ✅' : 'Наряд ещё не получен'}
              </span>
            </div>
            <Checkbox checked={item.isOwned} onChange={onToggleOwned} />
          </div>

          {/* Примечание (условия получения) */}
          {item.notes && item.notes.trim() && (
            <div className="p-4 rounded-2xl bg-romantic-gold/5 border border-romantic-gold/20">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-romantic-crimson flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-nunito font-bold text-romantic-crimson uppercase tracking-wider mb-1">
                    ⚠️ Особые условия получения
                  </p>
                  <p className="text-sm font-nunito text-romantic-dark/80 leading-relaxed">
                    {item.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Декоративный элемент */}
          <div className="text-center pt-2">
            <span className="text-romantic-gold/30 text-xs font-cormorant italic">
              ✦ Magic Wardrobe ✦
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}