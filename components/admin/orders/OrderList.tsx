import { OrderRow } from "./OrderRow"

interface Order {
  id: string
  orderNumber: string
  total: number
  paymentStatus: "PAID" | "UNPAID"
  createdAt: string
}

interface OrderListProps {
  orders: Order[]
}

export function OrderList({ orders }: OrderListProps) {
  // Sort orders by createdAt descending (newest first)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No orders found</div>
        <div className="text-gray-400 text-sm mt-2">Orders will appear here when customers place them</div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Mobile Layout */}
      <div className="block md:hidden space-y-4 p-4">
        {sortedOrders.map((order) => (
          <OrderRow key={order.id} order={order} isMobile={true} />
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedOrders.map((order) => (
              <OrderRow key={order.id} order={order} isMobile={false} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
