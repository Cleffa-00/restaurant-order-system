"use client"

import * as React from "react"
import { cn } from "@/lib/utils/common"

interface TabIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab: string
  tabs: Array<{ value: string; element: HTMLElement | null }>
}

const TabIndicator = React.forwardRef<HTMLDivElement, TabIndicatorProps>(
  ({ className, activeTab, tabs, ...props }, ref) => {
    const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({})

    React.useEffect(() => {
      const activeTabElement = tabs.find((tab) => tab.value === activeTab)?.element

      if (activeTabElement) {
        const rect = activeTabElement.getBoundingClientRect()
        const parentRect = activeTabElement.parentElement?.getBoundingClientRect()

        if (parentRect) {
          setIndicatorStyle({
            width: rect.width,
            transform: `translateX(${rect.left - parentRect.left}px)`,
          })
        }
      }
    }, [activeTab, tabs])

    return (
      <div
        ref={ref}
        className={cn("absolute bottom-0 h-0.5 bg-primary transition-all duration-200 ease-out", className)}
        style={indicatorStyle}
        {...props}
      />
    )
  },
)
TabIndicator.displayName = "TabIndicator"

export { TabIndicator }
