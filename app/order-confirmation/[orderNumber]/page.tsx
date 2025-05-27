// app/order-confirmation/[orderNumber]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { CartApiService } from "@/lib/api/cart"
import { OrderWithDetails } from "@/types"
import { formatCurrency } from "@/lib/utils/cart"
import { CheckCircle, Clock, ChefHat, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const orderNumber = params.orderNumber as string

  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取订单详情
  useEffect(() => {
    if (!orderNumber) return

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const result = await CartApiService.trackOrderByNumber(orderNumber)
        
        if (result.success && result.data) {
          setOrder(result.data)
        } else {
          setError(result.error?.message || "Order not found")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderNumber])

  // 订单状态图标和文本
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          icon: <Clock className="w-6 h-6 text-yellow-600" />,
          text: "Order Received",
          description: "We've received your order and are preparing it."
        }
      case "PREPARING":
        return {
          icon: <ChefHat className="w-6 h-6 text-blue-600" />,
          text: "Preparing",
          description: "Your order is being prepared by our kitchen."
        }
      case "READY":
        return {
          icon: <Package className="w-6 h-6 text-green-600" />,
          text: "Ready for Pickup",
          description: "Your order is ready! Please come pick it up."
        }
      case "COMPLETED":
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          text: "Completed",
          description: "Order completed. Thank you!"
        }
      default:
        return {
          icon: <Clock className="w-6 h-6 text-gray-600" />,
          text: "Processing",
          description: "Processing your order..."
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <div className="text-lg text-gray-600">Loading order details...</div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The order you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/menu")} className="bg-gray-900 hover:bg-gray-800">
            Back to Menu
          </Button>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 订单状态 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            {statusInfo.icon}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{statusInfo.text}</h3>
              <p className="text-gray-600">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        {/* 客户信息 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Name: </span>
              <span className="font-medium">{order.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone: </span>
              <span className="font-medium">{order.phone}</span>
            </div>
            {order.customerNote && (
              <div>
                <span className="text-gray-600">Notes: </span>
                <span className="font-medium">{order.customerNote}</span>
              </div>
            )}
          </div>
        </div>

        {/* 订单详情 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.nameSnapshot}</h4>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  {item.note && (
                    <p className="text-sm text-gray-500 italic">Note: {item.note}</p>
                  )}
                  {item.options && item.options.length > 0 && (
                    <div className="mt-1">
                      {item.options.map((option) => (
                        <div key={option.id} className="text-sm text-gray-600">
                          {option.groupNameSnapshot}: {option.optionNameSnapshot}
                          {option.quantity > 1 && ` (${option.quantity})`}
                          {option.priceDelta > 0 && ` +${formatCurrency(option.priceDelta * option.quantity)}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-medium">{formatCurrency(item.finalPrice)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 价格明细 */}
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee</span>
              <span>{formatCurrency(order.serviceFee)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push("/menu")}
            className="flex-1"
          >
            Order More
          </Button>
          <Button 
            onClick={() => router.push(`/track-order/${order.orderNumber}`)}
            className="flex-1 bg-gray-900 hover:bg-gray-800"
          >
            Track Order
          </Button>
        </div>
      </div>
    </div>
  )
}