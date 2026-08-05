import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden magic-bg">
      {/* Десктопный сайдбар */}
      <Sidebar />

      {/* Основная область */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Контент с анимацией перехода */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
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