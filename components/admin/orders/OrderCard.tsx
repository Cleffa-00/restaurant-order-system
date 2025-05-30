"use client"

import { formatOrderTime } from "@/lib/utils/date-utils"
import type { Order } from "@/types/order"

interface OrderCardProps {
  order: Order
  onClick?: () => void
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const formatCurrency = (amount: number | string | null | undefined) => {
    // 安全地转换为数字
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0)
    
    // 检查是否为有效数字
    if (isNaN(numAmount)) {
      console.warn('Invalid amount for order:', order.id, 'amount:', amount)
      return '$0.00'
    }
    
    return `$${numAmount.toFixed(2)}`
  }

  const getCardBackground = (paymentStatus: string) => {
    return paymentStatus === "PAID" ? "bg-green-50" : "bg-yellow-50"
  }

  const getTextColor = (paymentStatus: string) => {
    return paymentStatus === "PAID" ? "text-green-800" : "text-yellow-800"
  }

  const getBorderColor = (paymentStatus: string) => {
    return paymentStatus === "PAID" ? "border-green-200" : "border-yellow-200"
  }

  return (
    <div
      className={`
        ${getCardBackground(order.paymentStatus)}
        ${getTextColor(order.paymentStatus)}
        ${getBorderColor(order.paymentStatus)}
        rounded-md p-3 shadow-none hover:shadow-sm transition-all duration-200 
        cursor-pointer border
        aspect-square flex flex-col justify-between min-h-0
        transform hover:scale-105
      `}
      onClick={onClick}
    >
      {/* Order Number - Top */}
      <div className="text-center">
        <h3 className="text-xs font-medium leading-tight truncate">{order.orderNumber}</h3>
      </div>

      {/* Total Amount - Center */}
      <div className="text-center flex-1 flex items-center justify-center">
        <div className="text-sm font-semibold leading-none">{formatCurrency(order.total)}</div>
      </div>

      {/* Order Time - Bottom */}
      <div className="text-center">
        <p className="text-xs font-normal opacity-80 leading-tight">{formatOrderTime(order.createdAt)}</p>
      </div>
    </div>
  )
}