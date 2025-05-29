"use client"

import * as React from "react"
import { cn } from "@/lib/utils/common"

interface CarouselIndicatorsProps {
  total: number
  current: number
  onSelect: (index: number) => void
  orientation?: "horizontal" | "vertical"
  className?: string
}

const CarouselIndicators = React.forwardRef<HTMLDivElement, CarouselIndicatorsProps>(
  ({ total, current, onSelect, orientation = "horizontal", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "carousel-indicators",
          "flex gap-2",
          orientation === "horizontal" ? "justify-center mt-4" : "flex-col items-center ml-4",
          className,
        )}
        {...props}
      >
        {Array.from({ length: total }, (_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              "hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
              current === index ? "bg-black" : "bg-gray-300",
            )}
            onClick={() => onSelect(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    )
  },
)
CarouselIndicators.displayName = "CarouselIndicators"

export { CarouselIndicators }
