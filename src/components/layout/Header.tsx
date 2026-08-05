import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()

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
          <span className="text-xs sm:text-sm text-romantic-gold/70 font-nunito hidden sm:inline">
            — Трекер гардероба
          </span>
        </button>

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-romantic-gold to-romantic-crimson 
                        flex items-center justify-center text-white font-nunito text-xs sm:text-sm font-bold shadow-magic">
          КР
        </div>
      </div>
    </header>
  )
}