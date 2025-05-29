"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils/common"
import { TabNavigation } from "../navigation/tab-navigation"
import { TabPanel } from "../navigation/tab-panel"
import { TabIndicator } from "../navigation/tab-indicator"

const Tabs = TabsPrimitive.Root

const TabsList = TabNavigation

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "pills" | "underline"
    size?: "sm" | "default" | "lg"
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      {
        default:
          "rounded-sm px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        pills:
          "rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        underline:
          "border-b-2 border-transparent px-4 py-2 text-sm data-[state=active]:border-primary data-[state=active]:text-foreground",
      }[variant],
      {
        sm: "text-xs px-2 py-1",
        default: "text-sm px-3 py-1.5",
        lg: "text-base px-4 py-2",
      }[size],
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = TabPanel

export { Tabs, TabsList, TabsTrigger, TabsContent, TabNavigation, TabPanel, TabIndicator }
