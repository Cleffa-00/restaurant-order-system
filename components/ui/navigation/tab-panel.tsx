import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils/common"

interface TabPanelProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  padding?: "none" | "sm" | "default" | "lg"
}

const TabPanel = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, TabPanelProps>(
  ({ className, padding = "default", ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        {
          none: "",
          sm: "mt-1 p-2",
          default: "mt-2 p-4",
          lg: "mt-4 p-6",
        }[padding],
        className,
      )}
      {...props}
    />
  ),
)
TabPanel.displayName = "TabPanel"

export { TabPanel }
