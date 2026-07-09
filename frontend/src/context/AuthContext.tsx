import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
  }

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/users/me')
      const userData = response.data
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('Failed to fetch user context:', error)
      logout()
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        try {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
          
          // Verify token validity with backend
          await refreshUser()
        } catch (error) {
          console.error('Auth initialization failed:', error)
          logout()
        }
      }
      setIsLoading(false)
    }

    initializeAuth()

    // Handle logout event emitted by axios response interceptor
    const handleLogoutEvent = () => {
      logout()
    }
    window.addEventListener('auth-logout', handleLogoutEvent)

    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token: jwtToken, user: userData } = response.data

      localStorage.setItem('token', jwtToken)
      localStorage.setItem('user', JSON.stringify(userData))

      setToken(jwtToken)
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      logout()
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: any) => {
    setIsLoading(true)
    try {
      await api.post('/api/auth/register', data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
