import { motion } from 'framer-motion'
import type { WardrobeCategory } from '../../core/types/wardrobe'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../core/types/wardrobe'

interface CategoryTabsProps {
  activeCategory: WardrobeCategory | 'all'
  onChange: (category: WardrobeCategory | 'all') => void
  counts?: Record<WardrobeCategory | 'all', number>
}

const TABS: Array<{ value: WardrobeCategory | 'all'; label: string; icon: string }> = [
  { value: 'all', label: 'Все', icon: '👗' },
  { value: 'dress', label: CATEGORY_LABELS.dress, icon: CATEGORY_ICONS.dress },
  { value: 'hairstyle', label: CATEGORY_LABELS.hairstyle, icon: CATEGORY_ICONS.hairstyle },
  { value: 'accessory', label: CATEGORY_LABELS.accessory, icon: CATEGORY_ICONS.accessory },
  { value: 'makeup', label: CATEGORY_LABELS.makeup, icon: CATEGORY_ICONS.makeup },
]

export default function CategoryTabs({ activeCategory, onChange, counts }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {TABS.map((tab) => {
        const isActive = activeCategory === tab.value
        const count = counts?.[tab.value]

        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-2xl
              font-nunito text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${isActive
                ? 'bg-romantic-gold/20 text-romantic-dark shadow-magic'
                : 'bg-white/50 text-romantic-dark/60 hover:bg-romantic-pink/50 hover:text-romantic-dark'
              }
            `}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {count !== undefined && (
              <motion.span
                key={`${tab.value}-${count}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className={`
                  ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold
                  ${isActive
                    ? 'bg-romantic-gold/30 text-romantic-dark'
                    : 'bg-romantic-pink text-romantic-dark/50'
                  }
                `}
              >
                {count}
              </motion.span>
            )}
            {/* Подчёркивание активной вкладки */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 
                           bg-romantic-gold rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}