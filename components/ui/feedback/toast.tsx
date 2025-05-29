"use client"

import * as React from "react"
import { X, CheckCircle, XCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils/common"

export interface ToastProps {
  type: "success" | "error" | "info"
  message: string
  duration?: number
  onClose?: () => void
  className?: string
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ type, message, duration = 3000, onClose, className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 300) // Wait for exit animation
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [duration, onClose])

    const handleClose = () => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }

    const getIcon = () => {
      switch (type) {
        case "success":
          return <CheckCircle className="h-5 w-5" />
        case "error":
          return <XCircle className="h-5 w-5" />
        case "info":
          return <Info className="h-5 w-5" />
      }
    }

    const getStyles = () => {
      switch (type) {
        case "success":
          return "bg-green-600 text-white"
        case "error":
          return "bg-red-600 text-white"
        case "info":
          return "bg-blue-600 text-white"
      }
    }

    if (!isVisible) {
      return (
        <div
          ref={ref}
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-3 rounded-md px-4 py-3 shadow-lg",
            "animate-out fade-out-0 slide-out-to-right-full duration-300",
            getStyles(),
            className,
          )}
        >
          {getIcon()}
          <span className="text-sm font-medium">{message}</span>
          <button onClick={handleClose} className="ml-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-3 rounded-md px-4 py-3 shadow-lg",
          "animate-in fade-in-0 slide-in-from-right-full duration-300",
          getStyles(),
          className,
        )}
      >
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={handleClose} className="ml-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  },
)
Toast.displayName = "Toast"

// Toast Manager for handling multiple toasts
interface ToastItem extends ToastProps {
  id: string
}

interface ToastManagerProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ transform: `translateY(${index * 60}px)` }}
          className="transition-transform duration-300"
        >
          <Toast {...toast} onClose={() => onRemove(toast.id)} />
        </div>
      ))}
    </div>
  )
}

export { Toast }
