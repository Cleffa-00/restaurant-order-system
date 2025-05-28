'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
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
  accessToken: string | null
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
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 检查cookies和localStorage的同步
  const syncTokensFromCookies = useCallback(() => {
    // 获取cookies中的tokens (仅在客户端)
    if (typeof document !== 'undefined') {
      const cookieAccessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1]
      
      const cookieRefreshToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('refreshToken='))
        ?.split('=')[1]

      const localAccessToken = localStorage.getItem('accessToken')
      const localRefreshToken = localStorage.getItem('refreshToken')

      // 如果cookies中有新的tokens，同步到localStorage
      if (cookieAccessToken && cookieAccessToken !== localAccessToken) {
        // console.log('🔄 Syncing access token from cookies to localStorage')
        localStorage.setItem('accessToken', cookieAccessToken)
        setAccessToken(cookieAccessToken)
      }

      if (cookieRefreshToken && cookieRefreshToken !== localRefreshToken) {
        // console.log('🔄 Syncing refresh token from cookies to localStorage')
        localStorage.setItem('refreshToken', cookieRefreshToken)
      }
    }
  }, [])

  // 监听页面焦点，检查token同步
  useEffect(() => {
    const handleFocus = () => {
      syncTokensFromCookies()
    }

    window.addEventListener('focus', handleFocus)
    // 页面加载时也检查一次
    syncTokensFromCookies()

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [syncTokensFromCookies])
  const refreshAuth = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        setIsLoading(false)
        return
      }

      const response = await fetch(API_ENDPOINTS.REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const result = await response.json()
        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userData } = result.data

        setAccessToken(newAccessToken)
        setUser(userData)
        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        // Refresh失败，清除所有认证信息
        logout()
      }
    } catch (error) {
      // console.error('Auth refresh failed:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      const storedAccessToken = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('user')
      
      if (storedAccessToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setAccessToken(storedAccessToken)
          setUser(userData)
          
          // 验证access token是否仍然有效
          const profileResponse = await fetch(API_ENDPOINTS.PROFILE, {
            headers: {
              Authorization: `Bearer ${storedAccessToken}`,
            },
          })

          if (!profileResponse.ok) {
            // Access token无效，尝试刷新
            await refreshAuth()
          } else {
            setIsLoading(false)
          }
        } catch (error) {
          // console.error('Failed to parse stored user data:', error)
          await refreshAuth()
        }
      } else {
        await refreshAuth()
      }
    }

    initAuth()
  }, [refreshAuth])

  // 设置定时刷新 (每10分钟检查一次)
  useEffect(() => {
    // 使用 user 和 accessToken 来判断是否已认证
    if (!user || !accessToken) return

    const interval = setInterval(async () => {
      // 检查access token是否快过期 (提前2分钟刷新)
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]))
          const expiresAt = payload.exp * 1000
          const now = Date.now()
          
          // 如果距离过期时间少于2分钟，自动刷新
          if (expiresAt - now < 2 * 60 * 1000) {
            await refreshAuth()
          }
        } catch (error) {
          // console.error('Failed to check token expiration:', error)
        }
      }
    }, 10 * 60 * 1000) // 每10分钟检查一次

    return () => clearInterval(interval)
  }, [user, accessToken, refreshAuth])

  const login = async (data: LoginRequest) => {
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
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: newUser } = result.data

    setAccessToken(newAccessToken)
    setUser(newUser)
    localStorage.setItem('accessToken', newAccessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const register = async (data: RegisterRequest) => {
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
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: newUser } = result.data

    setAccessToken(newAccessToken)
    setUser(newUser)
    localStorage.setItem('accessToken', newAccessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  const value: AuthContextType = {
    user,
    accessToken,
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