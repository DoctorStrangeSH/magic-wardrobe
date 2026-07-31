import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden magic-bg">
      {/* Сайдбар — навигация */}
      <Sidebar />

      {/* Основная область */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Контент страниц */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Футер с подписью */}
        <footer className="py-3 px-6 text-center border-t border-romantic-pink/50">
          <p className="text-xs text-romantic-gold/60 font-nunito tracking-wider">
            ✦ Magic Wardrobe ✦ Твой магический трекер нарядов КР ✦
          </p>
        </footer>
      </div>
    </div>
  )
}