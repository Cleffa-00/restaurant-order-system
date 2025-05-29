"use client"

import { useState, useEffect } from 'react'
import { getOrder, updateOrderStatus, updatePaymentStatus } from '@/lib/api/client/orders'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { Order, OrderStatus, PaymentStatus } from '@/types/order'

interface OrderDetailModalProps {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
  onOrderUpdate?: (updatedOrder: Order) => void
}

export function OrderDetailModal({ 
  orderId, 
  isOpen, 
  onClose, 
  onOrderUpdate 
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取订单详情
  useEffect(() => {
    if (!isOpen || !orderId) {
      setOrder(null)
      setError(null)
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Fetching order details:', orderId)
        
        const response = await getOrder(orderId)
        
        if (response.success && response.data) {
          setOrder(response.data)
          console.log('✅ Order details loaded:', response.data)
        } else {
          setError(response.error?.message || 'Failed to load order')
        }
      } catch (err) {
        console.error('❌ Failed to fetch order:', err)
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, isOpen])

  // 更新订单状态
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return

    try {
      setUpdating(true)
      
      const response = await updateOrderStatus(order.id, { status: newStatus })
      
      if (response.success && response.data) {
        setOrder(response.data)
        onOrderUpdate?.(response.data)
        console.log('✅ Order status updated to:', newStatus)
      } else {
        alert('Failed to update order status: ' + (response.error?.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('❌ Status update error:', error)
      alert('Error updating order status')
    } finally {
      setUpdating(false)
    }
  }

  // 更新支付状态
  const handlePaymentStatusChange = async (newPaymentStatus: PaymentStatus) => {
    if (!order) return

    try {
      setUpdating(true)
      
      const response = await updatePaymentStatus(order.id, { 
        paymentStatus: newPaymentStatus 
      })
      
      if (response.success && response.data) {
        setOrder(response.data)
        onOrderUpdate?.(response.data)
        console.log('✅ Payment status updated to:', newPaymentStatus)
      } else {
        alert('Failed to update payment status: ' + (response.error?.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('❌ Payment status update error:', error)
      alert('Error updating payment status')
    } finally {
      setUpdating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* 弹窗头部 */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading order details...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Failed to load order
              </div>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  if (orderId) {
                    // Retry fetch
                    setLoading(true)
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          )}

          {order && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-600">Order #:</span> {order.orderNumber}</p>
                    <p><span className="font-medium text-gray-600">Customer:</span> {order.name}</p>
                    <p><span className="font-medium text-gray-600">Phone:</span> {order.phone}</p>
                    <p><span className="font-medium text-gray-600">Source:</span> {order.orderSource || 'N/A'}</p>
                    <p><span className="font-medium text-gray-600">Created:</span> {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Order Total</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-600">Subtotal:</span> ${order.subtotal.toFixed(2)}</p>
                    <p><span className="font-medium text-gray-600">Tax:</span> ${order.taxAmount.toFixed(2)}</p>
                    <p><span className="font-medium text-gray-600">Service Fee:</span> ${order.serviceFee.toFixed(2)}</p>
                    <div className="pt-2 border-t">
                      <p className="text-lg font-bold">
                        <span className="font-medium text-gray-600">Total:</span> ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 状态管理 */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-700 mb-4">Status Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Status
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                      disabled={updating}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="READY">Ready</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                      disabled={updating}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="UNPAID">Unpaid</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 订单项目 */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-700 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.quantity}x {item.nameSnapshot}
                          </h4>
                          {item.categorySnapshot && (
                            <p className="text-sm text-gray-500">{item.categorySnapshot}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.finalPrice.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">${item.unitPrice.toFixed(2)} each</p>
                        </div>
                      </div>
                      
                      {/* 选项 */}
                      {item.options.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-gray-100">
                          <p className="text-sm font-medium text-gray-600 mb-1">Options:</p>
                          {item.options.map((option) => (
                            <div key={option.id} className="text-sm text-gray-600 flex justify-between">
                              <span>
                                {option.quantity}x {option.optionNameSnapshot || 'Unknown Option'}
                                {option.groupNameSnapshot && (
                                  <span className="text-gray-400"> ({option.groupNameSnapshot})</span>
                                )}
                              </span>
                              <span>
                                {option.priceDelta !== 0 && (
                                  <span className={option.priceDelta > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {option.priceDelta > 0 ? '+' : ''}${option.priceDelta.toFixed(2)}
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* 备注 */}
                      {item.note && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm">
                            <span className="font-medium text-yellow-800">Note:</span>{' '}
                            <span className="text-yellow-700">{item.note}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 客户备注 */}
              {order.customerNote && (
                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-700 mb-3">Customer Note</h3>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">{order.customerNote}</p>
                  </div>
                </div>
              )}

              {/* 更新状态指示器 */}
              {updating && (
                <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="text-gray-600">Updating...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}