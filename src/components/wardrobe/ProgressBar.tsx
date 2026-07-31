import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // 0-100
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'gold' | 'crimson' | 'emerald'
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const colorStyles = {
  gold: 'from-romantic-gold to-romantic-lightGold',
  crimson: 'from-romantic-crimson to-romantic-softCrimson',
  emerald: 'from-emerald-400 to-emerald-300',
}

export default function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = 'md',
  color = 'gold',
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className="space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-sm font-nunito text-romantic-dark/70">{label}</span>
          )}
          {showPercentage && (
            <motion.span
              key={clampedValue}
              initial={{ scale: 1.2, color: '#d4a574' }}
              animate={{ scale: 1, color: '#2d1b4e' }}
              className="text-sm font-nunito font-bold text-romantic-dark/70"
            >
              {clampedValue}%
            </motion.span>
          )}
        </div>
      )}
      <div className={`w-full bg-romantic-pink/50 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colorStyles[color]} rounded-full relative`}
        >
          {/* Блик на полоске */}
          {clampedValue > 0 && (
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
          )}
        </motion.div>
      </div>
    </div>
  )
}