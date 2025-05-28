// lib/api/client.ts - 优化的 API 客户端
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
  private refreshPromise: Promise<string> | null = null

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  private async getStoredTokens() {
    if (typeof window === 'undefined') return null
    
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    }
  }

  private async setStoredTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('accessToken', accessToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
  }

  private async clearStoredTokens() {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  private async refreshAccessToken(): Promise<string> {
    // 防止多个同时的刷新请求
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    
    this.refreshPromise = this.performTokenRefresh()
    
    try {
      const newAccessToken = await this.refreshPromise
      return newAccessToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const tokens = await this.getStoredTokens()
    
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Token refresh failed')
      }

      const { accessToken } = result.data
      
      // 只更新 access token，保持原有的 refresh token
      await this.setStoredTokens(accessToken)
      
      return accessToken
      
    } catch (error) {
      
      // 刷新失败，清除所有 tokens 并重定向到登录页
      await this.clearStoredTokens()
      
      // 重定向到登录页
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      
      throw error
    }
  }

  private async getValidAccessToken(): Promise<string> {
    const tokens = await this.getStoredTokens()
    
    if (!tokens?.accessToken) {
      throw new Error('No access token available')
    }

    // 检查 token 是否即将过期（提前 30 秒刷新）
    try {
      const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]))
      const expiresAt = payload.exp * 1000 // 转换为毫秒
      const now = Date.now()
      const timeUntilExpiry = expiresAt - now
      
      // 如果 token 在 30 秒内过期，提前刷新
      if (timeUntilExpiry < 30000) {
        return await this.refreshAccessToken()
      }
      
      return tokens.accessToken
      
    } catch (error) {
      // 如果无法解析 token，尝试刷新
      return await this.refreshAccessToken()
    }
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      // 获取有效的 access token
      const accessToken = await this.getValidAccessToken()
      
      // 准备请求
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          ...options.headers,
        },
      }
      
      const response = await fetch(url, requestOptions)
      
      // 如果是 401，尝试刷新 token 并重试
      if (response.status === 401) {
        
        try {
          // 刷新 token（这会自动保存到 localStorage）
          const newAccessToken = await this.refreshAccessToken()
          
          // 🔧 关键修复：重新从 localStorage 获取最新的 token
          // 这确保我们使用的是刚刚保存的新 token
          const freshTokens = await this.getStoredTokens()
          const tokenToUse = freshTokens?.accessToken || newAccessToken
          
          // 使用最新的 token 重试请求
          const retryOptions: RequestInit = {
            ...requestOptions,
            headers: {
              ...requestOptions.headers,
              'Authorization': `Bearer ${tokenToUse}`,
            },
          }
          
          const retryResponse = await fetch(url, retryOptions)
          
          if (!retryResponse.ok) {
            throw new Error(`Request failed after token refresh: ${retryResponse.status}`)
          }
          
          const retryResult: ApiResponse<T> = await retryResponse.json()
          return retryResult
          
        } catch (refreshError) {
          throw refreshError
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Request failed: ${response.status}`)
      }
      
      const result: ApiResponse<T> = await response.json()
      return result
      
    } catch (error) {
      throw error
    }
  }

  // 便捷方法
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

  // 🆕 添加调试方法
  async debugTokens() {
    const tokens = await this.getStoredTokens()
    return tokens
  }
}

// 创建全局实例
export const apiClient = new ApiClient()

// 导出类型
export type { ApiClient, ApiResponse }