import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        success: "bg-green-100 text-green-800 hover:bg-green-200",
        warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        error: "bg-red-100 text-red-800 hover:bg-red-200",
        info: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        completed: "bg-green-100 text-green-800 hover:bg-green-200",
        cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status?: string
}

export function StatusBadge({ className, variant, size, status, children, ...props }: StatusBadgeProps) {
  // Auto-map common status strings to variants
  const getVariantFromStatus = (status: string) => {
    const statusMap: Record<string, typeof variant> = {
      PAID: "success",
      UNPAID: "warning",
      PENDING: "pending",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
      SUCCESS: "success",
      ERROR: "error",
      WARNING: "warning",
      INFO: "info",
    }
    return statusMap[status.toUpperCase()] || "default"
  }

  const finalVariant = variant || (status ? getVariantFromStatus(status) : "default")

  return (
    <div className={cn(statusBadgeVariants({ variant: finalVariant, size }), className)} {...props}>
      {children || status}
    </div>
  )
}
