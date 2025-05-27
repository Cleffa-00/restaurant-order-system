'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { LoginRequest, RegisterRequest, Role } from '@/types'
import { API_ENDPOINTS } from '@/types/api'

interface AuthUser {
  id: string
  phone: string
  name: string | null
  role: Role
  createdAt: Date
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider(props: AuthProviderProps) {
  const { children } = props
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initAuth()
  }, [])

  async function initAuth() {
    try {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
        await refreshAuth(storedToken)
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(data: LoginRequest) {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Login failed')
    }

    const result = await response.json()
    const { token: newToken, user: newUser } = result.data

    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
  }

  async function register(data: RegisterRequest) {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Registration failed')
    }

    const result = await response.json()
    const { token: newToken, user: newUser } = result.data

    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  async function refreshAuth(authToken?: string) {
    try {
      const tokenToUse = authToken || token
      if (!tokenToUse) return

      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setUser(result.data)
        setToken(tokenToUse)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Auth refresh failed:', error)
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
  
}