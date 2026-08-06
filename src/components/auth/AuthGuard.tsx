import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Sparkles } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, initAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  // Загрузка
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Sparkles size={48} className="text-romantic-gold animate-pulse-soft mx-auto" />
          <p className="text-romantic-dark/50 font-nunito text-sm">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Не авторизован — редирект на логин
  if (!user) {
    navigate('/login')
    return null
  }

  return <>{children}</>
}