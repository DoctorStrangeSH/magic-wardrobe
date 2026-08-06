import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuthStore()
  const [showMenu, setShowMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-lg border-b border-romantic-pink/50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
        >
          <Sparkles size={20} className="text-romantic-gold animate-pulse-soft" />
          <h1 className="font-cormorant text-xl sm:text-2xl font-bold text-romantic-dark tracking-wide">
            Клуб Романтики
          </h1>
        </button>

        {/* Профиль */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-romantic-pink/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-romantic-gold to-romantic-crimson 
                            flex items-center justify-center text-white font-nunito text-sm font-bold shadow-magic">
              {profile?.username?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className="text-sm font-nunito text-romantic-dark/70 hidden sm:inline">
              {profile?.username || user?.email?.split('@')[0] || 'Профиль'}
            </span>
          </button>

          {/* Выпадающее меню */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                className="absolute right-0 top-12 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-romantic-gold/20 overflow-hidden min-w-[200px]"
              >
                {/* Инфо о пользователе */}
                <div className="px-4 py-3 border-b border-romantic-pink/30">
                  <p className="text-sm font-nunito font-bold text-romantic-dark">
                    {profile?.username || 'Пользователь'}
                  </p>
                  <p className="text-xs text-romantic-dark/50 font-nunito">
                    {user?.email}
                  </p>
                  {profile?.role === 'admin' && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-romantic-gold/20 text-romantic-gold text-[10px] font-nunito font-bold">
                      ⭐ Админ
                    </span>
                  )}
                </div>

                {/* Кнопка выхода */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm font-nunito text-romantic-dark/70 hover:bg-red-50 hover:text-romantic-crimson transition-colors"
                >
                  <LogOut size={16} />
                  Выйти
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}