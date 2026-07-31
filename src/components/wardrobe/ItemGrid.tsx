import { AnimatePresence } from 'framer-motion'
import type { WardrobeItem } from '../../core/types/wardrobe'
import ItemCard from './ItemCard'
import { Sparkles } from 'lucide-react'

interface ItemGridProps {
  items: WardrobeItem[]
  isLoading?: boolean
  onEditItem?: (item: WardrobeItem) => void
}

export default function ItemGrid({ items, isLoading, onEditItem }: ItemGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl bg-romantic-pink/30 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Sparkles size={40} className="text-romantic-gold/30 mb-4" />
        <p className="text-romantic-dark/40 font-nunito text-sm">
          Здесь пока нет нарядов
        </p>
        <p className="text-romantic-dark/25 font-nunito text-xs mt-1">
          Добавь первый наряд, нажав кнопку выше ✨
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onEdit={onEditItem} />
        ))}
      </AnimatePresence>
    </div>
  )
}