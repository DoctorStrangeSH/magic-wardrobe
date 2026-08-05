import { AnimatePresence } from 'framer-motion'
import type { WardrobeItem } from '../../core/types/wardrobe'
import ItemCard from './ItemCard'
import { CardSkeleton } from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import { Sparkles, Plus } from 'lucide-react'

interface ItemGridProps {
  items: WardrobeItem[]
  isLoading?: boolean
  onEditItem?: (item: WardrobeItem) => void
  onAddClick?: () => void
}

export default function ItemGrid({ items, isLoading, onEditItem, onAddClick }: ItemGridProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles size={40} />}
        title="Нарядов пока нет"
        description="Добавь первый наряд — используй кнопку выше или быстрый импорт"
        action={onAddClick ? {
          label: 'Добавить наряд',
          onClick: onAddClick,
          icon: <Plus size={18} />,
        } : undefined}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <AnimatePresence>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} onEdit={onEditItem} />
        ))}
      </AnimatePresence>
    </div>
  )
}