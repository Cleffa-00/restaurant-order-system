// lib/api/cart.ts
// 使用 types/order.ts 中的类型定义

import { convertCartToOrder } from '@/lib/utils/cart'
// 导入订单相关的类型定义
import type { 
  Order, 
  CreateOrderRequest,
  OrderStatus,
  PaymentStatus,
  GetOrdersParams,
  GetOrdersResponse
} from '@/types/order'

interface ApiError {
  message: string
  code?: string
  details?: any
  errors?: string[]
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

// 定义返回类型
interface CartApiResult<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export class CartApiService {
  private static async handleResponse<T>(response: Response): Promise<CartApiResult<T>> {
    const contentType = response.headers.get('content-type')
    
    try {
      if (contentType && contentType.includes('application/json')) {
        const jsonData: ApiResponse<T> = await response.json()
        
        if (response.ok) {
          return {
            success: true,
            data: jsonData.data || (jsonData as unknown as T)
          }
        } else {
          // 构建详细的错误信息
          let errorMessage = jsonData.error?.message || jsonData.message || 'Unknown error'
          let errorDetails = {
            status: response.status,
            statusText: response.statusText,
            code: jsonData.error?.code,
            ...jsonData.error?.details
          }
          
          // 如果有验证错误列表，将其格式化
          if (jsonData.error?.errors && Array.isArray(jsonData.error.errors)) {
            errorMessage = `Validation failed:\n${jsonData.error.errors.join('\n')}`
            errorDetails.errors = jsonData.error.errors
          }
          
          return {
            success: false,
            error: errorMessage,
            details: errorDetails
          }
        }
      } else {
        // 非 JSON 响应
        const textData = await response.text()
        
        return {
          success: false,
          error: `Server error (${response.status}): ${response.statusText}`,
          details: { 
            status: response.status, 
            statusText: response.statusText,
            body: textData,
            contentType 
          }
        }
      }
    } catch (parseError) {
      return {
        success: false,
        error: `Failed to parse server response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
        details: { 
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error', 
          status: response.status,
          statusText: response.statusText
        }
      }
    }
  }

  // 创建订单
  static async createOrder(orderData: CreateOrderRequest): Promise<CartApiResult<Order>> {
    try {
      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await this.handleResponse<Order>(response)
      
      // 只在成功时记录日志
      if (result.success) {
        console.log('Order created successfully:', result.data?.orderNumber)
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`,
        details: { networkError: true }
      }
    }
  }

  // 获取订单列表
  static async getOrders(params?: GetOrdersParams): Promise<CartApiResult<GetOrdersResponse>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.phone) searchParams.set('phone', params.phone)
      if (params?.status) searchParams.set('status', params.status)
      if (params?.paymentStatus) searchParams.set('paymentStatus', params.paymentStatus)
      if (params?.date) searchParams.set('date', params.date)
      if (params?.orderNumber) searchParams.set('orderNumber', params.orderNumber)
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())

      const response = await fetch(`/api/v1/orders?${searchParams.toString()}`)
      return await this.handleResponse<GetOrdersResponse>(response)
    } catch (error) {
      console.error('Network error fetching orders:', error)
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`,
        details: { networkError: true }
      }
    }
  }

  // 获取单个订单
  static async getOrder(orderNumber: string): Promise<CartApiResult<Order>> {
    try {
      const response = await fetch(`/api/v1/orders/${orderNumber}`)
      return await this.handleResponse<Order>(response)
    } catch (error) {
      console.error('Network error fetching order:', error)
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`,
        details: { networkError: true }
      }
    }
  }

  // 更新订单状态
  static async updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<CartApiResult<Order>> {
    try {
      const response = await fetch(`/api/v1/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      return await this.handleResponse<Order>(response)
    } catch (error) {
      console.error('Network error updating order status:', error)
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`,
        details: { networkError: true }
      }
    }
  }

  // 更新支付状态
  static async updatePaymentStatus(orderNumber: string, paymentStatus: PaymentStatus): Promise<CartApiResult<Order>> {
    try {
      const response = await fetch(`/api/v1/orders/${orderNumber}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus }),
      })
      return await this.handleResponse<Order>(response)
    } catch (error) {
      console.error('Network error updating payment status:', error)
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`,
        details: { networkError: true }
      }
    }
  }

  // 调试用：验证订单数据
  static validateOrderData(orderData: CreateOrderRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // 检查必需字段
    if (!orderData.phone) {
      errors.push('Phone number is missing')
    } else if (typeof orderData.phone !== 'string') {
      errors.push('Phone number must be a string')
    } else if (orderData.phone.length < 10) {
      errors.push(`Phone number must be at least 10 digits (received: ${orderData.phone.length} digits)`)
    }

    if (!orderData.name) {
      errors.push('Customer name is missing')
    } else if (typeof orderData.name !== 'string') {
      errors.push('Customer name must be a string')
    } else if (orderData.name.trim().length < 2) {
      errors.push(`Customer name must be at least 2 characters (received: ${orderData.name.trim().length} characters)`)
    }

    if (!orderData.items || !Array.isArray(orderData.items)) {
      errors.push('Items array is missing or invalid')
    } else if (orderData.items.length === 0) {
      errors.push('No items in cart')
    }

    // 检查价格字段
    if (typeof orderData.subtotal !== 'number') {
      errors.push(`Subtotal must be a number (received: ${typeof orderData.subtotal})`)
    } else if (orderData.subtotal < 0) {
      errors.push(`Subtotal cannot be negative (received: ${orderData.subtotal})`)
    }

    if (typeof orderData.taxAmount !== 'number') {
      errors.push(`Tax amount must be a number (received: ${typeof orderData.taxAmount})`)
    } else if (orderData.taxAmount < 0) {
      errors.push(`Tax amount cannot be negative (received: ${orderData.taxAmount})`)
    }

    if (typeof orderData.serviceFee !== 'number') {
      errors.push(`Service fee must be a number (received: ${typeof orderData.serviceFee})`)
    } else if (orderData.serviceFee < 0) {
      errors.push(`Service fee cannot be negative (received: ${orderData.serviceFee})`)
    }

    if (typeof orderData.total !== 'number') {
      errors.push(`Total must be a number (received: ${typeof orderData.total})`)
    } else if (orderData.total < 1) {
      errors.push(`Total must be at least $1 (received: ${orderData.total})`)
    }

    // 验证每个订单项
    orderData.items?.forEach((item, index) => {
      const itemPrefix = `Item ${index + 1}`
      
      if (!item.menuItemId) {
        errors.push(`${itemPrefix}: Menu item ID is required`)
      }
      
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        errors.push(`${itemPrefix}: Quantity must be at least 1`)
      }
      
      if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
        errors.push(`${itemPrefix}: Unit price must be a valid number`)
      }
      
      if (typeof item.finalPrice !== 'number' || item.finalPrice < 0) {
        errors.push(`${itemPrefix}: Final price must be a valid number`)
      }

      // 验证选项
      if (item.options) {
        item.options.forEach((option, optIndex) => {
          const optionPrefix = `${itemPrefix}, Option ${optIndex + 1}`
          
          if (!option.menuOptionId) {
            errors.push(`${optionPrefix}: Menu option ID is required`)
          }
          
          if (typeof option.quantity !== 'number' || option.quantity < 0) {
            errors.push(`${optionPrefix}: Quantity must be a valid number`)
          }
          
          if (typeof option.priceDelta !== 'number') {
            errors.push(`${optionPrefix}: Price delta must be a number`)
          }
        })
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 根据订单号跟踪订单（用于确认页面）
  static async trackOrderByNumber(orderNumber: string): Promise<CartApiResult<Order>> {
    try {
      const response = await fetch(`/api/v1/orders/number/${orderNumber}`)
      return await this.handleResponse<Order>(response)
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`,
        details: { networkError: true }
      }
    }
  }
}