import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthState, LoginCredentials, authStorage, hasPermission, canAccessRoute } from '../lib/auth'
import toast from 'react-hot-toast'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  hasPermission: (requiredRole: string) => boolean
  canAccessRoute: (route: string) => boolean
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se usuário está logado ao carregar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = authStorage.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        authStorage.clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const users = authStorage.getUsers()
      const user = users.find(u => 
        u.username === credentials.username && 
        u.is_active
      )
      
      if (!user) {
        toast.error('Usuário não encontrado ou inativo')
        return false
      }

      // Verificar senha (em produção, usar hash)
      const { defaultPasswords } = await import('../lib/auth')
      const correctPassword = defaultPasswords[credentials.username]
      
      if (credentials.password !== correctPassword) {
        toast.error('Senha incorreta')
        return false
      }

      // Login bem-sucedido
      setUser(user)
      setIsAuthenticated(true)
      authStorage.setCurrentUser(user)
      
      toast.success(`Bem-vindo, ${user.name}!`)
      return true
      
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro interno do sistema')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    authStorage.clearAuth()
    toast.success('Logout realizado com sucesso!')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      authStorage.setCurrentUser(updatedUser)
      
      // Atualizar na lista de usuários
      const users = authStorage.getUsers()
      const updatedUsers = users.map(u => 
        u.id === user.id ? updatedUser : u
      )
      authStorage.saveUsers(updatedUsers)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission: (requiredRole: string) => user ? hasPermission(user.role, requiredRole) : false,
    canAccessRoute: (route: string) => user ? canAccessRoute(user.role, route) : false,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
