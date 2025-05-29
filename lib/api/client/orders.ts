// lib/api/orders.ts - 订单相关 API 函数

import { apiClient } from '@/lib/api/utils/client'
import type { 
  Order, 
  GetOrdersParams, 
  GetOrdersResponse, 
  UpdateOrderStatusRequest,
  UpdatePaymentStatusRequest,
  OrderStats 
} from '@/types/order'

export class OrdersAPI {
  /**
   * 获取订单列表（支持按日期、状态等筛选）
   */
  static async getOrders(params: GetOrdersParams = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.date) searchParams.append('date', params.date)
    if (params.status) searchParams.append('status', params.status)
    if (params.paymentStatus) searchParams.append('paymentStatus', params.paymentStatus)
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())

    const endpoint = `/api/v1/admin/orders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    return apiClient.get<GetOrdersResponse>(endpoint)
  }

  /**
   * 根据日期获取订单（简化版，直接返回订单数组）
   */
  static async getOrdersByDate(date: string) {
    try {
      const response = await OrdersAPI.getOrders({ date })
      return response.data?.orders || []
    } catch (error) {
      // console.error('Failed to get orders by date:', error)  
      throw error
    }
  }

  /**
   * 获取单个订单详情
   */
  static async getOrder(orderId: string) {
    return apiClient.get<Order>(`/api/v1/admin/orders/${orderId}`)
  }

  /**
   * 更新订单状态
   */
  static async updateOrderStatus(orderId: string, data: UpdateOrderStatusRequest) {
    return apiClient.patch<Order>(`/api/v1/admin/orders/${orderId}/status`, data)
  }

  /**
   * 更新支付状态
   */
  static async updatePaymentStatus(orderId: string, data: UpdatePaymentStatusRequest) {
    return apiClient.patch<Order>(`/api/v1/admin/orders/${orderId}/payment`, data)
  }

  /**
   * 删除订单（软删除或硬删除，取决于后端实现）
   */
  static async deleteOrder(orderId: string) {
    return apiClient.delete(`/api/v1/admin/orders/${orderId}`)
  }

  /**
   * 获取订单统计信息
   */
  static async getOrderStats(date?: string) {
    const endpoint = date 
      ? `/api/v1/admin/orders/stats?date=${date}`
      : '/api/v1/admin/orders/stats'
    
    return apiClient.get<OrderStats>(endpoint)
  }

  /**
   * 批量更新订单状态
   */
  static async batchUpdateStatus(orderIds: string[], status: UpdateOrderStatusRequest['status']) {
    return apiClient.patch('/api/v1/admin/orders/batch/status', {
      orderIds,
      status
    })
  }

  /**
   * 搜索订单（按订单号、客户姓名、电话号码）
   */
  static async searchOrders(query: string) {
    return apiClient.get<Order[]>(`/api/v1/admin/orders/search?q=${encodeURIComponent(query)}`)
  }
}

// 导出便捷函数 - 修复：直接调用静态方法
export const getOrders = (params?: GetOrdersParams) => OrdersAPI.getOrders(params)
export const getOrdersByDate = (date: string) => OrdersAPI.getOrdersByDate(date)
export const getOrder = (orderId: string) => OrdersAPI.getOrder(orderId)
export const updateOrderStatus = (orderId: string, data: UpdateOrderStatusRequest) => 
  OrdersAPI.updateOrderStatus(orderId, data)
export const updatePaymentStatus = (orderId: string, data: UpdatePaymentStatusRequest) => 
  OrdersAPI.updatePaymentStatus(orderId, data)
export const deleteOrder = (orderId: string) => OrdersAPI.deleteOrder(orderId)
export const getOrderStats = (date?: string) => OrdersAPI.getOrderStats(date)
export const batchUpdateStatus = (orderIds: string[], status: UpdateOrderStatusRequest['status']) => 
  OrdersAPI.batchUpdateStatus(orderIds, status)
export const searchOrders = (query: string) => OrdersAPI.searchOrders(query)