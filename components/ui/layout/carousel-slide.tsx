import * as React from "react"
import { cn } from "@/lib/utils/common"

interface CarouselSlideProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  isActive?: boolean
}

const CarouselSlide = React.forwardRef<HTMLDivElement, CarouselSlideProps>(
  ({ className, orientation = "horizontal", isActive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn(
          "carousel-slide",
          "min-w-0 shrink-0 grow-0 basis-full",
          orientation === "horizontal" ? "pl-4" : "pt-4",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
CarouselSlide.displayName = "CarouselSlide"

export { CarouselSlide }
