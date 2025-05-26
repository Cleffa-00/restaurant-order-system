"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SlidePanelProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  side?: "right" | "bottom"
  children: React.ReactNode
  className?: string
}

const SlidePanel = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SlidePanelProps>(
  ({ isOpen, onClose, title, side = "right", children, className }, ref) => {
    if (!isOpen) return null

    const sideStyles = {
      right: "fixed inset-y-0 right-0 w-[90vw] sm:w-[400px] rounded-l-md",
      bottom: "fixed inset-x-0 bottom-0 h-[70vh] sm:h-[400px] rounded-t-md",
    }

    const animationStyles = {
      right: "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
      bottom: "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
    }

    return (
      <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              "z-50 bg-white p-4 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              sideStyles[side],
              animationStyles[side],
              className,
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between mb-4",
                side === "bottom" ? "border-b border-gray-200 pb-4" : "",
              )}
            >
              {title && (
                <DialogPrimitive.Title className="text-lg font-semibold text-gray-900">{title}</DialogPrimitive.Title>
              )}
              <DialogPrimitive.Close
                onClick={onClose}
                className={cn(
                  "rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
                  !title && "ml-auto",
                )}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">关闭</span>
              </DialogPrimitive.Close>
            </div>

            {/* Content */}
            <div
              className={cn(
                "flex-1 overflow-y-auto",
                side === "bottom" ? "max-h-[calc(70vh-80px)] sm:max-h-[calc(400px-80px)]" : "max-h-[calc(100vh-80px)]",
              )}
            >
              {children}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    )
  },
)

SlidePanel.displayName = "SlidePanel"

export { SlidePanel }
export type { SlidePanelProps }
