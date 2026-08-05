import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden magic-bg">
      {/* Десктопный сайдбар */}
      <Sidebar />

      {/* Основная область */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Контент */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Футер (только десктоп) */}
        <footer className="hidden lg:block py-3 px-6 text-center border-t border-romantic-pink/50">
          <p className="text-xs text-romantic-gold/60 font-nunito tracking-wider">
            ✦ Magic Wardrobe ✦ Твой магический трекер нарядов КР ✦
          </p>
        </footer>
      </div>
    </div>
  )
}