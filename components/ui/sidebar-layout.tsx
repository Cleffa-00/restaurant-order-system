"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X, Menu } from "lucide-react"

export interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode
  children: React.ReactNode
  sidebarWidth?: string
  position?: "left" | "right"
  collapsible?: boolean
  defaultCollapsed?: boolean
  overlay?: boolean
}

export function SidebarLayout({
  className,
  sidebar,
  children,
  sidebarWidth = "w-64",
  position = "left",
  collapsible = true,
  defaultCollapsed = false,
  overlay = false,
  ...props
}: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // Close mobile sidebar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileOpen && overlay) {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobileOpen, overlay])

  const sidebarContent = (
    <div className={cn("h-full bg-white border-gray-200", position === "left" ? "border-r" : "border-l")}>
      {sidebar}
    </div>
  )

  return (
    <div className={cn("flex h-full", position === "right" && "flex-row-reverse", className)} {...props}>
      {/* Mobile menu button */}
      {collapsible && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="bg-white shadow-md"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col transition-all duration-300",
          sidebarWidth,
          isCollapsed && collapsible && "w-16",
        )}
      >
        {collapsible && (
          <div className="p-4 border-b border-gray-200">
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="w-full">
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        )}
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />

          {/* Sidebar */}
          <div
            className={cn(
              "relative flex flex-col bg-white shadow-xl transition-transform duration-300",
              sidebarWidth,
              position === "right" && "ml-auto",
            )}
          >
            <div className="p-4 border-b border-gray-200">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="ml-auto">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  )
}
