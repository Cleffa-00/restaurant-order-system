"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarDayProps {
  date: Date
  isSelected?: boolean
  isToday?: boolean
  isOutsideMonth?: boolean
  isDisabled?: boolean
  onSelect?: (date: Date) => void
  className?: string
}

const CalendarDay = React.forwardRef<HTMLButtonElement, CalendarDayProps>(
  ({ date, isSelected, isToday, isOutsideMonth, isDisabled, onSelect, className }, ref) => {
    const handleClick = () => {
      if (!isDisabled && onSelect) {
        onSelect(date)
      }
    }

    return (
      <td className="h-8 w-8 text-center text-xs p-0 relative focus-within:relative focus-within:z-20 sm:h-9 sm:w-9 sm:text-sm">
        <Button
          ref={ref}
          variant="ghost"
          className={cn(
            "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-xs sm:h-9 sm:w-9 sm:text-sm",
            isSelected &&
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            isToday && !isSelected && "bg-accent text-accent-foreground",
            isOutsideMonth && "text-muted-foreground opacity-50",
            isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
            className,
          )}
          onClick={handleClick}
          disabled={isDisabled}
          aria-selected={isSelected}
        >
          {date.getDate()}
        </Button>
      </td>
    )
  },
)
CalendarDay.displayName = "CalendarDay"

export { CalendarDay }
