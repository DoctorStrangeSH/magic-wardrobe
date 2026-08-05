import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'circle' | 'rect'
}

export default function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const baseClass = 'bg-romantic-pink/40 rounded-xl'
  
  const variantClasses = {
    text: 'h-4 w-full',
    card: 'aspect-[3/4] w-full',
    circle: 'rounded-full aspect-square',
    rect: 'h-24 w-full',
  }

  return (
    <motion.div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="romantic-card rounded-2xl overflow-hidden shadow-card">
      <Skeleton variant="card" className="rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-5 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="romantic-card rounded-2xl p-5 shadow-card flex items-center gap-4">
          <Skeleton variant="circle" className="w-12 h-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}