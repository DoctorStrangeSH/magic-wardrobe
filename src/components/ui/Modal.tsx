import { type ReactNode, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Оверлей */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-romantic-darker/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Контейнер модалки */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              relative w-full ${sizeStyles[size]}
              romantic-card rounded-3xl shadow-magic-lg
              border border-romantic-gold/10
              max-h-[90vh] flex flex-col
            `}
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-romantic-pink/50">
              <h2 className="font-cormorant text-xl font-bold text-romantic-dark">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-romantic-gold/60 hover:text-romantic-crimson 
                           hover:bg-romantic-pink/50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Содержимое */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {children}
            </div>

            {/* Декоративная полоска снизу */}
            <div className="px-6 pb-2">
              <hr className="golden-divider" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}