"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  description?: string
  status?: React.ReactNode
  actions?: React.ReactNode
  image?: string
  imageAlt?: string
  variant?: "default" | "compact" | "detailed"
}

export function DataCard({
  className,
  title,
  subtitle,
  description,
  status,
  actions,
  image,
  imageAlt,
  variant = "default",
  onClick,
  ...props
}: DataCardProps) {
  const isClickable = !!onClick

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isClickable && "cursor-pointer hover:shadow-md hover:scale-105",
        variant === "compact" && "aspect-square",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <CardContent className={cn("p-4", variant === "compact" && "flex flex-col justify-between h-full")}>
        {/* Image */}
        {image && (
          <div className="relative w-full h-32 mb-3 bg-gray-100 rounded-md overflow-hidden">
            <img src={image || "/placeholder.svg"} alt={imageAlt || title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-semibold text-gray-900 truncate", variant === "compact" ? "text-sm" : "text-base")}>
              {title}
            </h3>
            {subtitle && (
              <p className={cn("text-gray-600 truncate", variant === "compact" ? "text-xs" : "text-sm")}>{subtitle}</p>
            )}
          </div>
          {status && <div className="ml-2 flex-shrink-0">{status}</div>}
        </div>

        {/* Description */}
        {description && variant !== "compact" && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        )}

        {/* Actions */}
        {actions && <div className="flex items-center justify-end mt-auto">{actions}</div>}
      </CardContent>
    </Card>
  )
}
