// lib/api/cart.ts
import { 
    CreateOrderRequest, 
    OrderWithDetails, 
    ApiResponse,
    CreatePaymentIntentRequest,
    CreatePaymentIntentResponse 
  } from "@/types"
  import { API_ENDPOINTS } from "@/types/api"
  
  export class CartApiService {
    /**
     * 创建订单
     */
    static async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<OrderWithDetails>> {
      try {
        const response = await fetch(API_ENDPOINTS.ORDERS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        })
  
        const result = await response.json()
  
        if (!response.ok) {
          throw new Error(result.error?.message || `HTTP error! status: ${response.status}`)
        }
  
        return result
      } catch (error) {
        throw error
      }
    }
  
    /**
     * 获取订单详情
     */
    static async getOrder(orderId: string): Promise<ApiResponse<OrderWithDetails>> {
      try {
        const response = await fetch(API_ENDPOINTS.ORDER_BY_ID(orderId))
        const result = await response.json()
  
        if (!response.ok) {
          throw new Error(result.error?.message || `HTTP error! status: ${response.status}`)
        }
  
        return result
      } catch (error) {
        throw error
      }
    }
  
    /**
     * 通过订单号跟踪订单
     */
    static async trackOrderByNumber(orderNumber: string): Promise<ApiResponse<OrderWithDetails>> {
      try {
        const response = await fetch(API_ENDPOINTS.ORDER_BY_NUMBER(orderNumber))
        const result = await response.json()
  
        if (!response.ok) {
          throw new Error(result.error?.message || `HTTP error! status: ${response.status}`)
        }
  
        return result
      } catch (error) {
        throw error
      }
    }
  
    /**
     * 创建支付意图
     */
    static async createPaymentIntent(orderId: string): Promise<ApiResponse<CreatePaymentIntentResponse>> {
      try {
        const response = await fetch(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId })
        })
  
        const result = await response.json()
  
        if (!response.ok) {
          throw new Error(result.error?.message || `HTTP error! status: ${response.status}`)
        }
  
        return result
      } catch (error) {
        throw error
      }
    }
  
    /**
     * 确认支付
     */
    static async confirmPayment(orderId: string, paymentIntentId: string): Promise<ApiResponse<OrderWithDetails>> {
      try {
        const response = await fetch(API_ENDPOINTS.CONFIRM_PAYMENT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId, paymentIntentId })
        })
  
        const result = await response.json()
  
        if (!response.ok) {
          throw new Error(result.error?.message || `HTTP error! status: ${response.status}`)
        }
  
        return result
      } catch (error) {
        throw error
      }
    }
  }