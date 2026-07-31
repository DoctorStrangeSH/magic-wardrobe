import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: ReactNode
  children: ReactNode
}

const variantStyles = {
  primary: `
    bg-gradient-to-r from-romantic-gold to-romantic-lightGold
    text-romantic-darker font-semibold
    shadow-magic-lg hover:shadow-card-hover
    hover:from-romantic-lightGold hover:to-romantic-gold
  `,
  secondary: `
    bg-romantic-pink/50 text-romantic-dark
    border border-romantic-gold/20
    hover:bg-romantic-pink hover:border-romantic-gold/40
  `,
  ghost: `
    text-romantic-gold/70 hover:text-romantic-gold
    hover:bg-romantic-pink/30
  `,
  danger: `
    bg-romantic-crimson/10 text-romantic-crimson
    border border-romantic-crimson/20
    hover:bg-romantic-crimson/20 hover:border-romantic-crimson/40
  `,
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-2xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-nunito font-medium
        transform active:scale-95 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}