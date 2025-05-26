import type * as React from "react"
import { cn } from "@/lib/utils"

export interface GridLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: "sm" | "default" | "lg"
  minItemWidth?: string
  children: React.ReactNode
}

export function GridLayout({
  className,
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = "default",
  minItemWidth,
  children,
  ...props
}: GridLayoutProps) {
  const getGridClasses = () => {
    const gapClasses = {
      sm: "gap-2",
      default: "gap-4",
      lg: "gap-6",
    }

    const columnClasses = [
      `grid-cols-${columns.default}`,
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`,
    ].filter(Boolean)

    return cn("grid", gapClasses[gap], ...columnClasses)
  }

  const gridStyle = minItemWidth
    ? {
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
      }
    : undefined

  return (
    <div className={cn(getGridClasses(), className)} style={gridStyle} {...props}>
      {children}
    </div>
  )
}
