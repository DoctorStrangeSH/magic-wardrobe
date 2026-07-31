import { Sparkles } from 'lucide-react'
import ImportExportPanel from '../forms/ImportExportPanel'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Заголовок */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Sparkles size={24} className="text-romantic-gold" />
          <h2 className="font-cormorant text-3xl font-bold text-romantic-dark">
            Настройки
          </h2>
          <Sparkles size={24} className="text-romantic-gold" />
        </div>
        <hr className="golden-divider max-w-md mx-auto" />
      </div>

      {/* Панель импорта/экспорта */}
      <ImportExportPanel />

      {/* О приложении */}
      <div className="romantic-card rounded-2xl p-6 shadow-card text-center space-y-3">
        <h3 className="font-cormorant text-lg font-bold text-romantic-dark">
          ✦ Magic Wardrobe ✦
        </h3>
        <p className="text-sm text-romantic-dark/50 font-nunito">
          Трекер гардероба для Клуба Романтики
        </p>
        <p className="text-xs text-romantic-dark/30 font-nunito">
          Версия 1.0.0 • Все данные хранятся локально в браузере
        </p>
        <div className="flex justify-center gap-2 text-romantic-gold/30 text-xs">
          <span>👗</span>
          <span>💎</span>
          <span>✨</span>
          <span>📖</span>
          <span>❤️</span>
        </div>
      </div>
    </div>
  )
}