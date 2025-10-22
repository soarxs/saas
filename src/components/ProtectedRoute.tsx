import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'caixa' | 'ceo' | 'admin'
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, canAccessRoute } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate(fallbackPath)
        return
      }

      if (requiredRole && user && !canAccessRoute(fallbackPath)) {
        // Se não tem permissão, redireciona para dashboard
        navigate('/')
        return
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, canAccessRoute, navigate, fallbackPath])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user && user.role !== requiredRole && !canAccessRoute(fallbackPath)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
