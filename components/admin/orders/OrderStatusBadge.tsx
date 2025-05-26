import { Badge } from "@/components/ui/badge"

interface OrderStatusBadgeProps {
  status: "PAID" | "UNPAID"
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
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
  }

  const config = getStatusConfig(status)

  return <Badge className={config.className}>{config.label}</Badge>
}
