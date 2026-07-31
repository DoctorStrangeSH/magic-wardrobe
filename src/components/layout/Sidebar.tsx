import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Library, BarChart3, Settings, Sparkles, X } from 'lucide-react'

const menuItems = [
  { path: '/', label: 'Истории', icon: Library },
  { path: '/stats', label: 'Статистика', icon: BarChart3 },
  { path: '/settings', label: 'Настройки', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const NavContent = () => (
    <>
      {/* Логотип */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-romantic-gold/10">
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

      {/* Навигация */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
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
              <span className="font-nunito text-sm font-medium whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Декоративные звёздочки снизу */}
      <div className="px-4 py-4 border-t border-romantic-gold/10">
        <p className="text-xs text-romantic-gold/40 text-center italic font-cormorant">
          <Sparkles size={12} className="inline mr-1" />
          Магия стиля КР
          <Sparkles size={12} className="inline ml-1" />
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Десктопный сайдбар */}
      <aside className="hidden lg:flex flex-col w-60 bg-gradient-to-b from-romantic-darker via-romantic-dark to-romantic-darker
                        border-r border-romantic-gold/20">
        <NavContent />
      </aside>

      {/* Мобильная нижняя навигация */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-romantic-darker/95 backdrop-blur-md 
                       border-t border-romantic-gold/20 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors
                  ${isActive 
                    ? 'text-romantic-lightGold' 
                    : 'text-romantic-gold/50'
                  }
                `}
              >
                <Icon size={22} />
                <span className="text-xs font-nunito">{item.label}</span>
              </Link>
            )
          })}

          {/* Кнопка меню (если нужно будет позже) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-romantic-gold/50"
          >
            <Sparkles size={22} />
            <span className="text-xs font-nunito">Меню</span>
          </button>
        </div>
      </nav>

      {/* Оверлей мобильного меню */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-romantic-darker/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-romantic-darker via-romantic-dark to-romantic-darker
                          border-r border-romantic-gold/20 shadow-2xl overflow-y-auto">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-romantic-gold/60 hover:text-romantic-gold"
              >
                <X size={24} />
              </button>
            </div>
            <NavContent />
          </div>
        </div>
      )}

      {/* Отступ для мобильной навигации */}
      <div className="lg:hidden h-16" />
    </>
  )
}