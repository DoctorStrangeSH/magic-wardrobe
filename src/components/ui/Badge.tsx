import { type ReactNode } from 'react'

interface BadgeProps {
  variant?: 'gold' | 'free' | 'diamond' | 'crimson' | 'default'
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const variantStyles = {
  gold: 'bg-romantic-gold/15 text-romantic-gold border-romantic-gold/30',
  free: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  diamond: 'bg-blue-50 text-blue-600 border-blue-200',
  crimson: 'bg-romantic-crimson/10 text-romantic-crimson border-romantic-crimson/20',
  default: 'bg-romantic-pink/50 text-romantic-dark/70 border-romantic-pink',
}

export default function Badge({ variant = 'default', icon, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 
        rounded-full text-[11px] font-nunito font-semibold
        border ${variantStyles[variant]}
        shadow-sm
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}