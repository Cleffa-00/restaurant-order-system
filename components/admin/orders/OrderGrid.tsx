"use client"

import { OrderCard } from "./OrderCard"

interface Order {
  id: string
  orderNumber: string
  total: number
  paymentStatus: "PAID" | "UNPAID"
  createdAt: string
  name: string
  phone: string
}

interface OrderGridProps {
  orders: Order[]
}

export function OrderGrid({ orders }: OrderGridProps) {
  // Sort orders by createdAt descending (newest first) within the selected date
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleOrderClick = (orderId: string) => {
    // TODO: implement order details modal
    console.log("Clicked order:", orderId)
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
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
      {sortedOrders.map((order) => (
        <OrderCard key={order.id} order={order} onClick={() => handleOrderClick(order.id)} />
      ))}
    </div>
  )
}
