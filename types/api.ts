import { NextRequest } from 'next/server'
import { User, Role } from './index'

// ============================================
// API Route Handler Types
// ============================================

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    phone: string
    role: Role
  }
}

// ============================================
// API Response Builders
// ============================================

export class ApiResponseBuilder {
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      message
    }
  }

  static error(message: string, code: string, statusCode: number, details?: any) {
    return {
      success: false,
      error: {
        message,
        code,
        statusCode,
        details
      }
    }
  }

  static paginated<T>(data: T[], total: number, page: number, limit: number) {
    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}

// ============================================
// Common API Error Codes
// ============================================

export enum ApiErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Business logic errors
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INVALID_ORDER_STATUS = 'INVALID_ORDER_STATUS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

// ============================================
// API Endpoints
// ============================================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  PROFILE: '/api/auth/profile',
  
  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  
  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY_BY_ID: (id: string) => `/api/categories/${id}`,
  CATEGORY_BY_SLUG: (slug: string) => `/api/categories/slug/${slug}`,
  
  // Menu Items
  MENU_ITEMS: '/api/menu-items',
  MENU_ITEM_BY_ID: (id: string) => `/api/menu-items/${id}`,
  MENU_ITEMS_BY_CATEGORY: (categoryId: string) => `/api/menu-items?categoryId=${categoryId}`,
  
  // Menu Options
  MENU_OPTION_GROUPS: '/api/menu-option-groups',
  MENU_OPTION_GROUP_BY_ID: (id: string) => `/api/menu-option-groups/${id}`,
  
  // Orders
  ORDERS: '/api/orders',
  ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
  ORDER_BY_NUMBER: (orderNumber: string) => `/api/orders/number/${orderNumber}`,
  ORDER_STATUS: (id: string) => `/api/orders/${id}/status`,
  ORDER_PAYMENT: (id: string) => `/api/orders/${id}/payment`,
  MY_ORDERS: '/api/orders/my-orders',
  
  // Payment
  CREATE_PAYMENT_INTENT: '/api/payment/create-intent',
  CONFIRM_PAYMENT: '/api/payment/confirm',
  PAYMENT_WEBHOOK: '/api/payment/webhook',
  
  // Analytics
  DASHBOARD_STATS: '/api/analytics/dashboard',
  REVENUE_REPORT: '/api/analytics/revenue',
  POPULAR_ITEMS: '/api/analytics/popular-items',
  
  // Public
  PUBLIC_MENU: '/api/public/menu',
  PUBLIC_CATEGORIES: '/api/public/categories',
  TRACK_ORDER: '/api/public/track-order'
} as const

// ============================================
// Request Validation Schemas (使用 Zod 的类型定义)
// ============================================

export interface ValidationSchema {
  body?: Record<string, any>
  query?: Record<string, any>
  params?: Record<string, any>
}

// ============================================
// Middleware Types
// ============================================

export interface MiddlewareContext {
  request: AuthenticatedRequest
  params: Record<string, string>
}

export type MiddlewareFunction = (
  context: MiddlewareContext
) => Promise<Response | void>

// ============================================
// Rate Limiting Types
// ============================================

export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  keyGenerator?: (req: NextRequest) => string
}

// ============================================
// Cache Types
// ============================================

export interface CacheConfig {
  key: string
  ttl: number // Time to live in seconds
  tags?: string[]
}

export interface CacheEntry<T> {
  data: T
  expiresAt: number
  tags: string[]
}