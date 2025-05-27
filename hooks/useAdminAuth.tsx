// hooks/useAdminAuth.ts
'use client'

import { useAuth } from './useAuth'
import { Role } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAdminAuth() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  const isAdmin = user?.role === Role.ADMIN
  const canAccessAdmin = isAuthenticated && isAdmin

  useEffect(() => {
    if (!isLoading && !canAccessAdmin) {
      router.push('/login')
    }
  }, [isLoading, canAccessAdmin, router])

  const logoutAndRedirect = () => {
    logout()
    router.push('/login')
  }

  return {
    user,
    isAdmin,
    canAccessAdmin,
    isLoading,
    logout: logoutAndRedirect,
    isAuthorized: canAccessAdmin,
  }
}