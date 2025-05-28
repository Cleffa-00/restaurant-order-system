// lib/api/client.ts - 支持 HttpOnly Cookies 的修复版本
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
}

class ApiClient {
  private baseURL: string
  private isRefreshing: boolean = false
  private refreshPromise: Promise<void> | null = null

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  // 🔥 简化的 token 获取 - 优先使用可访问的 token，但不要求必须有
  private async getStoredTokens() {
    if (typeof window === 'undefined') return null
    
    // 检查 localStorage 中的 tokens（用于客户端设置的情况）
    const localAccessToken = localStorage.getItem('accessToken')
    const localRefreshToken = localStorage.getItem('refreshToken')
    
    // 检查非 HttpOnly cookies（用于兼容性）
    const cookieAccessToken = this.getCookie('accessToken')
    const cookieRefreshToken = this.getCookie('refreshToken')
    
    console.log('🔍 Token 检查结果:', {
      localStorage: {
        access: !!localAccessToken,
        refresh: !!localRefreshToken
      },
      cookies: {
        access: !!cookieAccessToken,
        refresh: !!cookieRefreshToken
      }
    })
    
    // 返回找到的任何 token，优先使用 localStorage
    return {
      accessToken: localAccessToken || cookieAccessToken,
      refreshToken: localRefreshToken || cookieRefreshToken
    }
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  private async setStoredTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === 'undefined') return
    
    // 只设置 localStorage，不设置 cookies（服务器会设置 HttpOnly cookies）
    localStorage.setItem('accessToken', accessToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
    
    console.log('✅ Tokens 已保存到 localStorage')
  }

  private async clearStoredTokens() {
    if (typeof window === 'undefined') return
    
    // 清除 localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    console.log('🗑️ 已清除 localStorage 中的 tokens')
  }

  // 🔥 关键修复：处理 token 刷新，但不阻止请求
  private async refreshAccessToken(): Promise<void> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    
    this.refreshPromise = this.performTokenRefresh()
    
    try {
      await this.refreshPromise
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<void> {
    const tokens = await this.getStoredTokens()
    
    try {
      console.log('🔄 尝试刷新 token...')
      
      // 发送刷新请求，依赖 HttpOnly cookies 或 localStorage refresh token
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 🔥 确保发送 HttpOnly cookies
        body: JSON.stringify({
          refreshToken: tokens?.refreshToken || '' // 可能为空，服务器会从 cookies 获取
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Token refresh failed')
      }

      // 如果返回了新的 access token，保存到 localStorage
      if (result.data?.accessToken) {
        await this.setStoredTokens(result.data.accessToken)
        console.log('✅ Token 刷新成功')
      }
      
    } catch (error) {
      console.error('❌ Token 刷新失败:', error)
      
      // 刷新失败，清除 localStorage 并重定向到登录页
      await this.clearStoredTokens()
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      
      throw error
    }
  }

  // 🔥 核心修复：不强制要求 access token，依赖服务器端验证
  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      // 获取可用的 tokens（可能为空）
      const tokens = await this.getStoredTokens()
      
      // 🔥 关键：准备请求头，但不要求必须有 token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      }
      
      // 如果有 access token，添加到请求头
      if (tokens?.accessToken) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`
        console.log('🎫 使用 localStorage token 发送请求')
      } else {
        console.log('🍪 依赖 HttpOnly cookies 发送请求')
      }
      
      const requestOptions: RequestInit = {
        ...options,
        credentials: 'include', // 🔥 始终包含 cookies
        headers,
      }
      
      console.log('🚀 API 请求:', {
        url,
        method: requestOptions.method || 'GET',
        hasAuthHeader: !!headers['Authorization'],
        hasCredentials: requestOptions.credentials === 'include'
      })
      
      const response = await fetch(url, requestOptions)
      
      // 🔥 如果是 401 且我们有 refresh token 或者依赖 cookies，尝试刷新
      if (response.status === 401) {
        console.log('🔄 收到 401，尝试刷新 token...')
        
        try {
          await this.refreshAccessToken()
          
          // 重新获取 tokens（可能已更新）
          const newTokens = await this.getStoredTokens()
          
          // 重试请求
          const retryHeaders = { ...headers }
          if (newTokens?.accessToken) {
            retryHeaders['Authorization'] = `Bearer ${newTokens.accessToken}`
          }
          
          const retryOptions: RequestInit = {
            ...requestOptions,
            headers: retryHeaders,
          }
          
          console.log('🔄 使用新 token 重试请求...')
          const retryResponse = await fetch(url, retryOptions)
          
          if (!retryResponse.ok) {
            throw new Error(`请求失败: ${retryResponse.status}`)
          }
          
          const retryResult: ApiResponse<T> = await retryResponse.json()
          console.log('✅ 重试请求成功')
          return retryResult
          
        } catch (refreshError) {
          console.error('❌ Token 刷新和重试失败:', refreshError)
          throw refreshError
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: { message: `Request failed: ${response.status}` }
        }))
        throw new Error(errorData.error?.message || errorData.message || `Request failed: ${response.status}`)
      }
      
      const result: ApiResponse<T> = await response.json()
      console.log('✅ API 请求成功:', endpoint)
      return result
      
    } catch (error) {
      console.error('❌ API 请求失败:', endpoint, error)
      throw error
    }
  }

  // 便捷方法保持不变
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // 调试方法
  async debugTokens() {
    const tokens = await this.getStoredTokens()
    console.log('🔍 当前 Token 状态:', tokens)
    return tokens
  }
}

// 创建全局实例
export const apiClient = new ApiClient()

// 导出类型
export type { ApiClient, ApiResponse }