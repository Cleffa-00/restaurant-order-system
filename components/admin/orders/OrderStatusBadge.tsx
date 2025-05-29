import { Badge } from "@/components/ui/feedback/badge"
import type { OrderStatus, PaymentStatus } from "@/types/order"

interface OrderStatusBadgeProps {
  status: OrderStatus | PaymentStatus
  type?: 'order' | 'payment'
}

export function OrderStatusBadge({ status, type = 'payment' }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string, type: string) => {
    if (type === 'payment') {
      switch (status) {
        case "PAID":
          return {
            label: "Paid",
            className: "bg-green-50 text-green-700 hover:bg-green-50 border-0 font-normal",
          }
        case "UNPAID":
          return {
            label: "Unpaid",
            className: "bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-0 font-normal",
          }
        default:
          return {
            label: status,
            className: "bg-gray-50 text-gray-700 hover:bg-gray-50 border-0 font-normal",
          }
      }
    } else {
      // Order status
      switch (status) {
        case "PENDING":
          return {
            label: "Pending",
            className: "bg-orange-50 text-orange-700 hover:bg-orange-50 border-0 font-normal",
          }
        case "PREPARING":
          return {
            label: "Preparing",
            className: "bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 font-normal",
          }
        case "READY":
          return {
            label: "Ready",
            className: "bg-purple-50 text-purple-700 hover:bg-purple-50 border-0 font-normal",
          }
        case "COMPLETED":
          return {
            label: "Completed",
            className: "bg-green-50 text-green-700 hover:bg-green-50 border-0 font-normal",
          }
        case "CANCELLED":
          return {
            label: "Cancelled",
            className: "bg-red-50 text-red-700 hover:bg-red-50 border-0 font-normal",
          }
        default:
          return {
            label: status,
            className: "bg-gray-50 text-gray-700 hover:bg-gray-50 border-0 font-normal",
          }
      }
    }
  }

  const config = getStatusConfig(status, type)

  return <Badge className={config.className}>{config.label}</Badge>
}