import { Sparkles, Search, Settings } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-romantic-pink/50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Левая часть — приветствие */}
        <div className="flex items-center gap-3">
          <Sparkles size={22} className="text-romantic-gold animate-pulse-soft" />
          <h1 className="font-cormorant text-2xl font-bold text-romantic-dark tracking-wide">
            Клуб Романтики
          </h1>
          <span className="text-sm text-romantic-gold/70 font-nunito hidden sm:inline">
            — Трекер гардероба
          </span>
        </div>

        {/* Правая часть — действия */}
        <div className="flex items-center gap-3">
          {/* Поиск (пока декоративный) */}
          <button className="p-2 rounded-xl text-romantic-gold/60 hover:text-romantic-gold hover:bg-romantic-pink/30 transition-colors">
            <Search size={20} />
          </button>

          {/* Настройки (пока декоративные) */}
          <button className="p-2 rounded-xl text-romantic-gold/60 hover:text-romantic-gold hover:bg-romantic-pink/30 transition-colors">
            <Settings size={20} />
          </button>

          {/* Аватар-заглушка */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-romantic-gold to-romantic-crimson 
                          flex items-center justify-center text-white font-nunito text-sm font-bold shadow-magic">
            КР
          </div>
        </div>
      </div>
    </header>
  )
}