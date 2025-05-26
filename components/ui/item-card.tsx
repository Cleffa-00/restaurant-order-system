"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export interface ItemCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  price: number
  image?: string
  imageAlt?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  available?: boolean
  variant?: "default" | "compact" | "detailed"
}

export function ItemCard({
  className,
  title,
  description,
  price,
  image,
  imageAlt,
  badge,
  actions,
  available = true,
  variant = "default",
  onClick,
  ...props
}: ItemCardProps) {
  const [imageError, setImageError] = React.useState(false)
  const isClickable = !!onClick

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        isClickable && available && "cursor-pointer hover:shadow-md",
        !available && "opacity-75 cursor-not-allowed",
        className,
      )}
      onClick={available ? onClick : undefined}
      {...props}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {image && !imageError ? (
          <img
            src={image || "/placeholder.svg"}
            alt={imageAlt || title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Badge overlay */}
        {badge && <div className="absolute top-2 right-2">{badge}</div>}

        {/* Unavailable overlay */}
        {!available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-lg px-4 py-2 bg-black/80 rounded">Sold Out</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{title}</h3>

        {description && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>}

        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-gray-900">{formatCurrency(price)}</span>

          {actions && available && <div className="flex items-center">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
