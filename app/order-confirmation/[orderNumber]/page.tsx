"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { CartApiService } from "@/lib/api/cart"
import { OrderWithDetails } from "@/types"
import { formatCurrency } from "@/lib/utils/cart"
import { 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Package, 
  Loader2, 
  RefreshCw,
  Phone,
  User,
  MessageSquare,
  ArrowLeft,
  Receipt,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const orderNumber = params.orderNumber as string

  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // 获取订单详情
  const fetchOrder = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)
      setError(null)
      
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
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!orderNumber) return
    fetchOrder()
  }, [orderNumber])

  // 自动刷新订单状态（如果订单还在进行中）
  useEffect(() => {
    if (!order || ['COMPLETED', 'CANCELLED'].includes(order.status)) return

    const interval = setInterval(() => {
      fetchOrder(true)
    }, 30000) // 每30秒刷新一次

    return () => clearInterval(interval)
  }, [order?.status])

  // 订单状态配置
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          icon: <Clock className="w-6 h-6 text-amber-600" />,
          text: "Order Received",
          description: "We've received your order and are preparing it.",
          color: "amber",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200"
        }
      case "PREPARING":
        return {
          icon: <ChefHat className="w-6 h-6 text-blue-600" />,
          text: "Preparing Your Order",
          description: "Our kitchen is carefully preparing your delicious meal.",
          color: "blue",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        }
      case "READY":
        return {
          icon: <Package className="w-6 h-6 text-green-600" />,
          text: "Ready for Pickup!",
          description: "Your order is ready! Please come pick it up at your convenience.",
          color: "green",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        }
      case "COMPLETED":
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          text: "Order Completed",
          description: "Thank you for your order! We hope you enjoyed your meal.",
          color: "green",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        }
      case "CANCELLED":
        return {
          icon: <Clock className="w-6 h-6 text-red-600" />,
          text: "Order Cancelled",
          description: "This order has been cancelled. If you have questions, please contact us.",
          color: "red",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        }
      default:
        return {
          icon: <Clock className="w-6 h-6 text-gray-600" />,
          text: "Processing",
          description: "Processing your order...",
          color: "gray",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200"
        }
    }
  }

  // 计算预计准备时间
  const getEstimatedTime = (status: string, createdAt: string) => {
    const orderTime = new Date(createdAt)
    const now = new Date()
    const minutesPassed = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60))

    switch (status) {
      case "PENDING":
        return "5-10 minutes until preparation starts"
      case "PREPARING":
        const remainingTime = Math.max(0, 20 - minutesPassed)
        return remainingTime > 0 ? `About ${remainingTime} minutes remaining` : "Ready soon"
      case "READY":
        return "Available for pickup now"
      case "COMPLETED":
        return "Order completed"
      case "CANCELLED":
        return "Order cancelled"
      default:
        return ""
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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The order you're looking for doesn't exist."}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => fetchOrder()} 
              variant="outline" 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => router.push("/menu")} 
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const estimatedTime = getEstimatedTime(order.status, String(order.createdAt))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                // 智能导航
                if (typeof window !== 'undefined') {
                  const referrer = document.referrer
                  const currentOrigin = window.location.origin
                  const isFromSameSite = referrer.startsWith(currentOrigin)
                  const isFromCheckout = referrer.includes('/checkout')
                  
                  if (window.history.length > 1 && isFromSameSite && isFromCheckout) {
                    router.back()
                  } else {
                    router.push('/menu')
                  }
                } else {
                  router.push('/menu')
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">Order Details</h1>
              <p className="text-sm text-gray-500">#{order.orderNumber}</p>
            </div>
            <button
              onClick={() => fetchOrder(true)}
              disabled={refreshing}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 成功提示横幅 */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-green-900">Order Confirmed!</h2>
              <p className="text-sm text-green-700">Your order has been successfully placed and is being processed.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 订单状态卡片 */}
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-6`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {statusInfo.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{statusInfo.text}</h3>
              <p className="text-gray-600 mb-2">{statusInfo.description}</p>
              {estimatedTime && (
                <p className="text-sm font-medium text-gray-700 bg-white/50 rounded-full px-3 py-1 inline-block">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {estimatedTime}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 客户信息 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{order.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{order.phone}</p>
              </div>
            </div>
            {order.customerNote && (
              <div className="sm:col-span-2 flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Order Notes</p>
                  <p className="font-medium text-gray-900">{order.customerNote}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 订单详情 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Order Items
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                {/* 商品图片 */}
                {item.imageUrlSnapshot && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                      src={item.imageUrlSnapshot} 
                      alt={item.nameSnapshot}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* 商品信息 */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{item.nameSnapshot}</h4>
                  <p className="text-sm text-gray-600 mb-2">Quantity: {item.quantity}</p>
                  
                  {/* 商品选项 */}
                  {item.options && item.options.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {item.options.map((option) => (
                        <div key={option.id} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 inline-block mr-1">
                          {option.groupNameSnapshot}: {option.optionNameSnapshot}
                          {option.quantity > 1 && ` (×${option.quantity})`}
                          {Number(option.priceDelta) > 0 && ` +${formatCurrency(Number(option.priceDelta) * option.quantity)}`}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 特殊说明 */}
                  {item.note && (
                    <p className="text-xs text-gray-500 italic bg-blue-50 rounded px-2 py-1 inline-block">
                      Note: {item.note}
                    </p>
                  )}
                </div>
                
                {/* 价格 */}
                <div className="text-right flex-shrink-0">
                  <span className="font-semibold text-gray-900">{formatCurrency(Number(item.finalPrice))}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 价格明细 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (8.75%)</span>
                <span>{formatCurrency(Number(order.taxAmount))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Service Fee</span>
                <span>{formatCurrency(Number(order.serviceFee))}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push("/menu")}
            className="flex-1"
          >
            Order More Food
          </Button>
          <Button 
            onClick={() => {
              // 分享订单链接
              if (navigator.share) {
                navigator.share({
                  title: `Order #${order.orderNumber}`,
                  text: `Track my order: ${order.orderNumber}`,
                  url: window.location.href
                })
              } else {
                // 复制链接到剪贴板
                navigator.clipboard.writeText(window.location.href)
                alert('Order link copied to clipboard!')
              }
            }}
            variant="outline"
            className="flex-1"
          >
            Share Order
          </Button>
        </div>

        {/* 帮助信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
          <p className="text-sm text-blue-700 mb-3">
            If you have any questions about your order or need to make changes, please contact us immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a 
              href={`tel:${order.phone}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Restaurant
            </a>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // 这里可以添加客服聊天功能
                alert('Customer service feature coming soon!')
              }}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
          </div>
        </div>

        {/* 订单时间信息 */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Order placed on {new Date(String(order.createdAt)).toLocaleString()}</p>
          <p className="text-xs">Order #{order.orderNumber}</p>
        </div>
      </div>
    </div>
  )
}