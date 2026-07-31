import { motion } from 'framer-motion'

interface ShimmerEffectProps {
  className?: string
}

export default function ShimmerEffect({ className = '' }: ShimmerEffectProps) {
  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none overflow-hidden rounded-2xl ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.5, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute inset-0 w-[200%] h-full"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          transform: 'skewX(-15deg)',
        }}
      />
    </motion.div>
  )
}