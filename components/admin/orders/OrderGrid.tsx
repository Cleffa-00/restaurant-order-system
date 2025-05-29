"use client"

import { useState } from "react"
import { OrderCard } from "./OrderCard"
import { OrderDetailModal } from "./OrderDetailModal"
import type { Order } from "@/types/order"

interface OrderGridProps {
  orders: Order[]
  onOrderUpdate?: (updatedOrder: Order) => void
}

export function OrderGrid({ orders, onOrderUpdate }: OrderGridProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sort orders by createdAt descending (newest first) within the selected date
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handleOrderClick = (orderId: string) => {
    console.log("Opening order details for:", orderId)
    setSelectedOrderId(orderId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrderId(null)
  }

  const handleOrderUpdate = (updatedOrder: Order) => {
    console.log("Order updated in modal:", updatedOrder)
    onOrderUpdate?.(updatedOrder)
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-400 italic mt-12">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-lg">No orders for this date</p>
        <p className="text-sm mt-2 opacity-75">Try selecting a different date or check back later</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
        {sortedOrders.map((order) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onClick={() => handleOrderClick(order.id)} 
          />
        ))}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        orderId={selectedOrderId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onOrderUpdate={handleOrderUpdate}
      />
    </>
  )
}

// 确保正确导出
export default OrderGrid