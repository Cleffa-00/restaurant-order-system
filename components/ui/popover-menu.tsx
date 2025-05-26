"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

interface PopoverMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  className?: string
}

const PopoverMenu = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverMenuProps>(
  ({ trigger, children, side = "bottom", align = "center", className, ...props }, ref) => {
    return (
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            ref={ref}
            side={side}
            align={align}
            className={cn(
              "z-50 w-48 rounded-md border bg-white p-2 shadow-md outline-none",
              "animate-in zoom-in-95 fade-in-0 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
              "dark:bg-gray-900 dark:text-white dark:border-gray-800",
              className,
            )}
            sideOffset={4}
            {...props}
          >
            {children}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  },
)

PopoverMenu.displayName = "PopoverMenu"

// 菜单项组件
const PopoverMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    disabled?: boolean
  }
>(({ className, disabled, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-800 dark:focus:bg-gray-800",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})

PopoverMenuItem.displayName = "PopoverMenuItem"

// 菜单分隔线组件
const PopoverMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700", className)} {...props} />
  },
)

PopoverMenuSeparator.displayName = "PopoverMenuSeparator"

export { PopoverMenu, PopoverMenuItem, PopoverMenuSeparator }
