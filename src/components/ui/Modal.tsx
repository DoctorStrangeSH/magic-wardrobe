import { type ReactNode, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-full mx-0 sm:mx-4',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Оверлей */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-romantic-darker/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Контейнер */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              mass: 1
            }}
            className={`
              relative w-full ${sizeStyles[size]}
              romantic-card sm:rounded-3xl rounded-t-3xl
              shadow-magic-lg border border-romantic-gold/10
              max-h-[90vh] flex flex-col
              sm:mx-4
            `}
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-romantic-pink/50 flex-shrink-0">
              <h2 className="font-cormorant text-lg sm:text-xl font-bold text-romantic-dark">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-1 rounded-xl text-romantic-gold/60 hover:text-romantic-crimson 
                           hover:bg-romantic-pink/50 active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Содержимое */}
            <div className="px-5 sm:px-6 py-4 overflow-y-auto flex-1">
              {children}
            </div>

            {/* Декоративная полоска */}
            <div className="px-5 sm:px-6 pb-2 flex-shrink-0">
              <hr className="golden-divider" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}