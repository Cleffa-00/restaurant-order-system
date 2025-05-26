"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, subtitle, action, className }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center justify-between mb-6", className)}>
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0 ml-4">{action}</div>}
      </div>
    )
  },
)
SectionHeader.displayName = "SectionHeader"

export { SectionHeader }
