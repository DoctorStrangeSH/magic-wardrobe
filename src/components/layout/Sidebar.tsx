import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Library, BarChart3, Heart, BookOpen, Settings, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

const menuItems = [
  { path: '/', label: 'Истории', icon: Library },
  { path: '/stats', label: 'Статистика', icon: BarChart3 },
  { path: '/wishlist', label: 'Хочу получить', icon: Heart },
  { path: '/journal', label: 'Дневник', icon: BookOpen },
  { path: '/settings', label: 'Настройки', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside 
      className={`
        relative flex flex-col bg-gradient-to-b from-romantic-darker via-romantic-dark to-romantic-darker
        border-r border-romantic-gold/20 transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Логотип */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-romantic-gold/10">
        <div className="w-8 h-8 flex-shrink-0">
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <circle cx="32" cy="32" r="30" fill="#2d1b4e" />
            <path d="M32 10L38 26H52L40 36L45 52L32 42L19 52L24 36L12 26H26L32 10Z" fill="#d4a574" />
          </svg>
        </div>
        {!collapsed && (
          <span className="font-cormorant text-lg font-semibold text-romantic-gold whitespace-nowrap">
            Мой гардероб
          </span>
        )}
      </div>

      {/* Навигация */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-romantic-gold/20 text-romantic-lightGold shadow-magic' 
                  : 'text-romantic-gold/60 hover:text-romantic-gold hover:bg-romantic-gold/10'
                }
              `}
              title={item.label}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && (
                <span className="font-nunito text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Кнопка сворачивания */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-romantic-gold/20 
                   border border-romantic-gold/30 rounded-full flex items-center justify-center
                   text-romantic-gold hover:bg-romantic-gold/30 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Декоративные звёздочки снизу */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-romantic-gold/10">
          <p className="text-xs text-romantic-gold/40 text-center italic font-cormorant">
            <Sparkles size={12} className="inline mr-1" />
            Магия стиля КР
            <Sparkles size={12} className="inline ml-1" />
          </p>
        </div>
      )}
    </aside>
  )
}