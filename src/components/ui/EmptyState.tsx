import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import Button from './Button'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  className?: string
}

export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-24 h-24 sm:w-32 sm:h-32 mb-6 rounded-full bg-romantic-pink/30 
                   flex items-center justify-center"
      >
        <div className="text-romantic-gold/50">
          {icon}
        </div>
      </motion.div>

      <h3 className="font-cormorant text-xl sm:text-2xl text-romantic-dark/60 mb-2">
        {title}
      </h3>
      <p className="text-romantic-dark/40 font-nunito text-sm max-w-md mb-6">
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          icon={action.icon}
          size="md"
        >
          {action.label}
        </Button>
      )}

      {/* Декоративные точки */}
      <div className="flex gap-1.5 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-romantic-gold/30"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: i * 0.3,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}