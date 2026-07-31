import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

export default function Checkbox({ checked, onChange, label, className = '' }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer group ${className}`}>
      <motion.div
        whileTap={{ scale: 0.85 }}
        animate={{
          borderColor: checked ? '#d4a574' : 'rgba(212,167,116,0.4)',
          backgroundColor: checked ? '#d4a574' : 'rgba(255,255,255,0.5)',
          boxShadow: checked 
            ? '0 0 12px rgba(212,167,116,0.4)' 
            : '0 0 0px rgba(212,167,116,0)',
        }}
        className={`
          w-5 h-5 rounded-md border-2 flex items-center justify-center
          transition-colors duration-200 flex-shrink-0
          group-hover:border-romantic-gold/70
        `}
      >
        <motion.div
          initial={false}
          animate={{ 
            scale: checked ? 1 : 0,
            rotate: checked ? 0 : -90,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <Check size={14} className="text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>
      {label && (
        <span className="text-sm text-romantic-dark/80 font-nunito select-none">
          {label}
        </span>
      )}
    </label>
  )
}