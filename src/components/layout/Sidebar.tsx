import { Link, useLocation } from 'react-router-dom'
import { Library, BarChart3, Settings, Sparkles } from 'lucide-react'

const menuItems = [
  { path: '/', label: 'Истории', icon: Library },
  { path: '/stats', label: 'Статистика', icon: BarChart3 },
  { path: '/settings', label: 'Настройки', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <>
      {/* Десктопный сайдбар */}
      <aside className="hidden lg:flex flex-col w-60 bg-gradient-to-b from-romantic-darker via-romantic-dark to-romantic-darker
                        border-r border-romantic-gold/20">
        <div className="flex items-center gap-3 px-4 py-5 border-b border-romantic-gold/10">
          <div className="w-8 h-8 flex-shrink-0">
            <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
              <circle cx="32" cy="32" r="30" fill="#2d1b4e" />
              <path d="M32 10L38 26H52L40 36L45 52L32 42L19 52L24 36L12 26H26L32 10Z" fill="#d4a574" />
            </svg>
          </div>
          <span className="font-cormorant text-lg font-semibold text-romantic-gold whitespace-nowrap">
            Мой гардероб
          </span>
        </div>

        <nav className="flex-1 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 mx-2 my-0.5 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-romantic-gold/20 text-romantic-lightGold shadow-magic' 
                    : 'text-romantic-gold/60 hover:text-romantic-gold hover:bg-romantic-gold/10'
                  }
                `}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="font-nunito text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-romantic-gold/10">
          <p className="text-xs text-romantic-gold/40 text-center italic font-cormorant">
            <Sparkles size={12} className="inline mr-1" />
            Магия стиля КР
            <Sparkles size={12} className="inline ml-1" />
          </p>
        </div>
      </aside>

      {/* Мобильная нижняя навигация */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 
                       bg-romantic-darker/95 backdrop-blur-md 
                       border-t border-romantic-gold/20 safe-area-bottom">
        <div className="flex items-center justify-around py-1.5 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[64px]
                  ${isActive 
                    ? 'text-romantic-lightGold bg-romantic-gold/10' 
                    : 'text-romantic-gold/50'
                  }
                `}
              >
                <Icon size={22} />
                <span className="text-[10px] font-nunito font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}