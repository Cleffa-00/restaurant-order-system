"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarHeaderProps {
  currentMonth: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  className?: string
}

const CalendarHeader = React.forwardRef<HTMLDivElement, CalendarHeaderProps>(
  ({ currentMonth, onPreviousMonth, onNextMonth, className }, ref) => {
    const monthYear = currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })

    return (
      <div ref={ref} className={cn("flex justify-center pt-1 relative items-center", className)}>
        <div className="text-sm font-medium">{monthYear}</div>
        <div className="space-x-1 flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
            onClick={onPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
            onClick={onNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  },
)
CalendarHeader.displayName = "CalendarHeader"

export { CalendarHeader }
