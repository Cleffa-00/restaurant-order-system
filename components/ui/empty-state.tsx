import type * as React from "react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ className, icon, title, description, action, ...props }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4", className)} {...props}>
      {icon && <div className="mb-4 text-gray-300 [&>svg]:w-12 [&>svg]:h-12">{icon}</div>}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {description && <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>}

      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
