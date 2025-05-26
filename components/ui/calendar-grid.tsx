"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CalendarGridProps {
  children: React.ReactNode
  className?: string
}

const CalendarGrid = React.forwardRef<HTMLTableElement, CalendarGridProps>(({ children, className }, ref) => {
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  return (
    <table ref={ref} className={cn("w-full border-collapse space-y-1", className)}>
      <thead>
        <tr className="flex">
          {weekDays.map((day) => (
            <th key={day} className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
})
CalendarGrid.displayName = "CalendarGrid"

export { CalendarGrid }
