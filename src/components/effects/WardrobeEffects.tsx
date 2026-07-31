import { useEffect, useState } from 'react'
import SparkleEffect from './SparkleEffect'

interface WardrobeEffectsProps {
  triggerSparkle: boolean
  onSparkleComplete?: () => void
}

/**
 * Компонент-обёртка для магических эффектов гардероба
 * Содержит логику появления звёздочек при отметке наряда
 */
export default function WardrobeEffects({ triggerSparkle, onSparkleComplete }: WardrobeEffectsProps) {
  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 })
  const [showSparkle, setShowSparkle] = useState(false)

  useEffect(() => {
    if (triggerSparkle) {
      // Позиция звёздочек — случайная в центре экрана
      setSparklePosition({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
      })
      setShowSparkle(true)

      const timer = setTimeout(() => {
        setShowSparkle(false)
        onSparkleComplete?.()
      }, 1200)

      return () => clearTimeout(timer)
    }
  }, [triggerSparkle, onSparkleComplete])

  return (
    <SparkleEffect
      isActive={showSparkle}
      x={sparklePosition.x}
      y={sparklePosition.y}
      count={15}
      colors={['#d4a574', '#f8e8e8', '#c41e3a', '#FFD700', '#e8d5b7', '#FF6B9D']}
    />
  )
}