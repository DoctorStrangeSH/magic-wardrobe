import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, User, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Button from '../ui/Button'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !password.trim()) {
      setError('Заполни все поля')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }

    setIsLoading(true)
    const result = await signUp(email.trim(), password, username.trim() || undefined)
    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Проверь почту для подтверждения!')
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 magic-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full 
                       bg-romantic-gold/20 mb-4"
          >
            <Sparkles size={36} className="text-romantic-gold" />
          </motion.div>
          <h1 className="font-cormorant text-3xl font-bold text-romantic-dark">
            Magic Wardrobe
          </h1>
          <p className="text-romantic-dark/50 font-nunito text-sm mt-1">
            Создай аккаунт и сохраняй гардероб
          </p>
        </div>

        <div className="romantic-card rounded-3xl p-6 sm:p-8 shadow-magic-lg border border-romantic-gold/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Имя */}
            <div>
              <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
                Имя (необязательно)
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-romantic-dark/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Твоё имя"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-romantic-gold/30 
                             bg-white/70 text-romantic-dark font-nunito text-base
                             placeholder:text-romantic-dark/30
                             focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20
                             transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-romantic-dark/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-romantic-gold/30 
                             bg-white/70 text-romantic-dark font-nunito text-base
                             placeholder:text-romantic-dark/30
                             focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20
                             transition-all"
                />
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-sm font-nunito font-medium text-romantic-dark mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-romantic-dark/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-romantic-gold/30 
                             bg-white/70 text-romantic-dark font-nunito text-base
                             placeholder:text-romantic-dark/30
                             focus:outline-none focus:border-romantic-gold focus:ring-2 focus:ring-romantic-gold/20
                             transition-all"
                />
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-nunito"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Успех */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-nunito"
              >
                <CheckCircle size={16} />
                {success}
              </motion.div>
            )}

            {/* Кнопка */}
            <Button
              type="submit"
              isLoading={isLoading}
              icon={<UserPlus size={18} />}
              className="w-full"
              size="lg"
            >
              Зарегистрироваться
            </Button>
          </form>

          <p className="text-center mt-6 text-sm font-nunito text-romantic-dark/50">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-romantic-gold hover:text-romantic-crimson font-semibold transition-colors">
              Войти
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-xs text-romantic-dark/30 hover:text-romantic-dark/50 font-nunito transition-colors">
            ← Вернуться на главную
          </Link>
        </p>
      </motion.div>
    </div>
  )
}