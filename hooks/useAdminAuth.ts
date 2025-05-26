'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminUser } from '@/lib/auth'

interface LoginCredentials {
  email: string
  password: string
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // In a real app, this would verify the token with the server
        // const response = await fetch('/api/auth/check')
        // const data = await response.json()
        
        // if (response.ok) {
        //   setUser(data.user)
        // }
        
        // For demo purposes, we'll just check if a token exists in cookies
        const hasToken = document.cookie.includes('admin-token=')
        if (hasToken) {
          // Mock user for demonstration
          setUser({
            id: '1',
            email: 'admin@example.com',
            role: 'ADMIN'
          })
        }
      } catch (e) {
        console.error('Auth check error:', e)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      
      // In a real app, this would call an API to authenticate
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(credentials),
      // })
      
      // const data = await response.json()
      
      // if (response.ok) {
      //   setUser(data.user)
      //   return true
      // } else {
      //   setError(data.message || 'Login failed')
      //   return false
      // }
      
      // For demo purposes, accept any login
      if (credentials.email && credentials.password) {
        // Set a mock cookie to simulate auth
        document.cookie = "admin-token=demo-token; path=/; max-age=86400"
        
        setUser({
          id: '1',
          email: credentials.email,
          role: 'ADMIN'
        })
        
        return true
      } else {
        setError('Email and password are required')
        return false
      }
    } catch (e) {
      console.error('Login error:', e)
      setError('An unexpected error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      // In a real app, this would call an API to logout
      // await fetch('/api/auth/logout', {
      //   method: 'POST',
      // })
      
      // For demo purposes, just clear the cookie
      document.cookie = "admin-token=; path=/; max-age=0"
      
      setUser(null)
      router.push('/auth/login')
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin: !!user && user.role === 'ADMIN'
  }
}
