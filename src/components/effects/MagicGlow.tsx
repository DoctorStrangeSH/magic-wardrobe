import { motion } from 'framer-motion'

interface MagicGlowProps {
  isActive?: boolean
  color?: string
  size?: number
  className?: string
}

export default function MagicGlow({
  isActive = false,
  color = '#d4a574',
  size = 60,
  className = '',
}: MagicGlowProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        scale: isActive ? [1, 1.3, 1] : 1,
        opacity: isActive ? [0.3, 0.6, 0.3] : 0.15,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(8px)',
      }}
    />
  )
}