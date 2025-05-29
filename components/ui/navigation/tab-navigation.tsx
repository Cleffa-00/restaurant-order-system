import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils/common"

interface TabNavigationProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: "default" | "pills" | "underline"
  size?: "sm" | "default" | "lg"
}

const TabNavigation = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabNavigationProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center text-muted-foreground",
        {
          default: "rounded-md bg-muted p-1",
          pills: "space-x-1",
          underline: "border-b border-border",
        }[variant],
        {
          sm: "h-8",
          default: "h-10",
          lg: "h-12",
        }[size],
        className,
      )}
      {...props}
    />
  ),
)
TabNavigation.displayName = "TabNavigation"

export { TabNavigation }
