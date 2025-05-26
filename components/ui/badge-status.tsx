"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeStatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  label?: string
  className?: string
}

const statusConfig = {
  pending: {
    className: "bg-yellow-100 text-yellow-800",
    defaultLabel: "Pending",
  },
  preparing: {
    className: "bg-blue-100 text-blue-800",
    defaultLabel: "Preparing",
  },
  ready: {
    className: "bg-green-100 text-green-800",
    defaultLabel: "Ready",
  },
  completed: {
    className: "bg-gray-100 text-gray-600",
    defaultLabel: "Completed",
  },
  cancelled: {
    className: "bg-red-100 text-red-800",
    defaultLabel: "Cancelled",
  },
}

const BadgeStatus = React.forwardRef<HTMLSpanElement, BadgeStatusProps>(
  ({ status, label, className, ...props }, ref) => {
    const config = statusConfig[status]
    const displayLabel = label || config.defaultLabel

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium",
          config.className,
          className,
        )}
        {...props}
      >
        {displayLabel}
      </span>
    )
  },
)

BadgeStatus.displayName = "BadgeStatus"

export { BadgeStatus }
