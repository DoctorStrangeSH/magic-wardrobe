import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  color: string
  rotation: number
  delay: number
}

interface SparkleEffectProps {
  isActive: boolean
  x?: number
  y?: number
  count?: number
  colors?: string[]
}

const DEFAULT_COLORS = ['#d4a574', '#f8e8e8', '#c41e3a', '#FFD700', '#FFA500', '#e8d5b7']

export default function SparkleEffect({
  isActive,
  x = 0,
  y = 0,
  count = 12,
  colors = DEFAULT_COLORS,
}: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  const generateSparkles = useCallback(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + Date.now(),
      x: (Math.random() - 0.5) * 120,
      y: (Math.random() - 0.5) * 120,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      delay: Math.random() * 0.3,
    }))
  }, [count, colors])

  useEffect(() => {
    if (isActive) {
      setSparkles(generateSparkles())
      const timer = setTimeout(() => setSparkles([]), 1000)
      return () => clearTimeout(timer)
    } else {
      setSparkles([])
    }
  }, [isActive, generateSparkles])

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{ left: x, top: y }}
    >
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{
              opacity: 1,
              scale: 0,
              x: 0,
              y: 0,
              rotate: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0],
              x: sparkle.x,
              y: sparkle.y - 30,
              rotate: sparkle.rotation,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 0.8,
              delay: sparkle.delay,
              ease: 'easeOut',
            }}
            className="absolute"
            style={{
              width: sparkle.size,
              height: sparkle.size,
            }}
          >
            {/* Звёздочка */}
            <svg
              viewBox="0 0 24 24"
              fill={sparkle.color}
              className="w-full h-full drop-shadow-lg"
            >
              <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}