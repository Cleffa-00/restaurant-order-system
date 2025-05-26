import { OrderStatusBadge } from "./OrderStatusBadge"

interface Order {
  id: string
  orderNumber: string
  total: number
  paymentStatus: "PAID" | "UNPAID"
  createdAt: string
}

interface OrderRowProps {
  order: Order
  isMobile?: boolean
}

export function OrderRow({ order, isMobile = false }: OrderRowProps) {
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(",", "")
  }

  // Mobile card layout
  if (isMobile) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <div className="font-medium text-gray-900">{order.orderNumber}</div>
          <OrderStatusBadge status={order.paymentStatus} />
        </div>
        <div className="space-y-1">
          <div className="text-lg font-semibold text-gray-900">{formatCurrency(order.total)}</div>
          <div className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</div>
        </div>
      </div>
    )
  }

  // Desktop table row
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatCurrency(order.total)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.createdAt)}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <OrderStatusBadge status={order.paymentStatus} />
      </td>
    </tr>
  )
}
