import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: ReactNode
  children: ReactNode
}

const variantStyles = {
  primary: `
    bg-gradient-to-r from-romantic-gold to-romantic-lightGold
    text-romantic-darker font-semibold
    shadow-magic active:shadow-sm
    hover:from-romantic-lightGold hover:to-romantic-gold
    active:scale-[0.97]
  `,
  secondary: `
    bg-romantic-pink/40 text-romantic-dark font-medium
    border border-romantic-gold/20
    hover:bg-romantic-pink hover:border-romantic-gold/40
    active:scale-[0.97]
  `,
  ghost: `
    text-romantic-dark/60 hover:text-romantic-dark font-medium
    hover:bg-romantic-pink/30
    active:scale-[0.97]
  `,
  danger: `
    bg-romantic-crimson/10 text-romantic-crimson font-medium
    border border-romantic-crimson/20
    hover:bg-romantic-crimson/20 hover:border-romantic-crimson/40
    active:scale-[0.97]
  `,
}

const sizeStyles = {
  xs: 'px-2.5 py-1.5 text-xs rounded-xl gap-1.5',
  sm: 'px-3.5 py-2 text-sm rounded-xl gap-1.5',
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
        inline-flex items-center justify-center font-nunito
        transform transition-all duration-200 select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-2 focus:ring-romantic-gold/40 focus:ring-offset-1
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === 'xs' ? 14 : 18} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}