"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CarouselNavigationProps {
  orientation?: "horizontal" | "vertical"
  canScrollPrev: boolean
  canScrollNext: boolean
  onPrevious: () => void
  onNext: () => void
  className?: string
  showPrevious?: boolean
  showNext?: boolean
}

const CarouselNavigation = React.forwardRef<HTMLDivElement, CarouselNavigationProps>(
  (
    {
      orientation = "horizontal",
      canScrollPrev,
      canScrollNext,
      onPrevious,
      onNext,
      className,
      showPrevious = true,
      showNext = true,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn("carousel-navigation", className)} {...props}>
        {showPrevious && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute h-8 w-8 rounded-full",
              orientation === "horizontal"
                ? "-left-12 top-1/2 -translate-y-1/2"
                : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
            )}
            disabled={!canScrollPrev}
            onClick={onPrevious}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Previous slide</span>
          </Button>
        )}

        {showNext && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute h-8 w-8 rounded-full",
              orientation === "horizontal"
                ? "-right-12 top-1/2 -translate-y-1/2"
                : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
            )}
            disabled={!canScrollNext}
            onClick={onNext}
          >
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Next slide</span>
          </Button>
        )}
      </div>
    )
  },
)
CarouselNavigation.displayName = "CarouselNavigation"

export { CarouselNavigation }
