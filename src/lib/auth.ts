// Sistema de Autenticação - CIA DO LANCHE PDV

export interface User {
  id: string
  username: string
  name: string
  role: 'caixa' | 'ceo' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

// Usuários padrão do sistema
export const defaultUsers: User[] = [
  {
    id: 'user-1',
    username: 'caixa',
    name: 'Operador de Caixa',
    role: 'caixa',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-2',
    username: 'ceo',
    name: 'CEO - Diretor',
    role: 'ceo',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-3',
    username: 'admin',
    name: 'Administrador',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Senhas padrão (em produção, usar hash)
export const defaultPasswords: Record<string, string> = {
  'caixa': '123456',
  'ceo': 'ceo123',
  'admin': 'admin123'
}

// Funções de armazenamento
export const authStorage = {
  getUsers: (): User[] => {
    const stored = localStorage.getItem('auth_users')
    if (!stored) {
      localStorage.setItem('auth_users', JSON.stringify(defaultUsers))
      return defaultUsers
    }
    return JSON.parse(stored)
  },

  saveUsers: (users: User[]): void => {
    localStorage.setItem('auth_users', JSON.stringify(users))
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('current_user')
    return stored ? JSON.parse(stored) : null
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('current_user')
    }
  },

  clearAuth: (): void => {
    localStorage.removeItem('current_user')
  }
}

// Verificar permissões
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'caixa': 1,
    'ceo': 2,
    'admin': 3
  }
  
  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= 
         roleHierarchy[requiredRole as keyof typeof roleHierarchy]
}

// Verificar se pode acessar rota
export const canAccessRoute = (userRole: string, route: string): boolean => {
  const routePermissions: Record<string, string[]> = {
    '/': ['caixa', 'ceo', 'admin'],
    '/admin': ['ceo', 'admin'],
    '/reports': ['ceo', 'admin'],
    '/settings': ['admin'],
    '/balcao': ['caixa', 'ceo', 'admin'],
    '/neighborhoods': ['admin'],
    '/print-config': ['admin']
  }
  
  const allowedRoles = routePermissions[route] || []
  return allowedRoles.includes(userRole)
}
