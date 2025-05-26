"use client"

import * as React from "react"
import { X, CheckCircle, XCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SnackbarProps {
  message: string
  type?: "success" | "error" | "info"
  duration?: number
  onClose?: () => void
  className?: string
}

const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>(
  ({ message, type = "info", duration = 3000, onClose, className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const [isPaused, setIsPaused] = React.useState(false)
    const timerRef = React.useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = React.useRef<number>(Date.now())
    const remainingTimeRef = React.useRef<number>(duration)

    const startTimer = React.useCallback(() => {
      if (duration > 0 && !isPaused) {
        timerRef.current = setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 300) // Wait for exit animation
        }, remainingTimeRef.current)
      }
    }, [duration, isPaused, onClose])

    const pauseTimer = React.useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        const elapsed = Date.now() - startTimeRef.current
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed)
      }
    }, [])

    const resumeTimer = React.useCallback(() => {
      startTimeRef.current = Date.now()
      startTimer()
    }, [startTimer])

    React.useEffect(() => {
      startTimer()
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    }, [startTimer])

    React.useEffect(() => {
      if (isPaused) {
        pauseTimer()
      } else {
        resumeTimer()
      }
    }, [isPaused, pauseTimer, resumeTimer])

    const handleClose = () => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }

    const handleMouseEnter = () => {
      setIsPaused(true)
    }

    const handleMouseLeave = () => {
      setIsPaused(false)
    }

    const getIcon = () => {
      switch (type) {
        case "success":
          return <CheckCircle className="h-4 w-4 flex-shrink-0" />
        case "error":
          return <XCircle className="h-4 w-4 flex-shrink-0" />
        case "info":
          return <Info className="h-4 w-4 flex-shrink-0" />
      }
    }

    const getStyles = () => {
      switch (type) {
        case "success":
          return "bg-green-600 text-white"
        case "error":
          return "bg-red-600 text-white"
        case "info":
          return "bg-gray-800 text-white"
      }
    }

    if (!isVisible) {
      return (
        <div
          ref={ref}
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
            "flex items-center gap-2 px-4 py-2 rounded-md shadow-lg text-sm",
            "animate-out fade-out-0 slide-out-to-bottom duration-300",
            getStyles(),
            className,
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {getIcon()}
          <span className="flex-1">{message}</span>
          {onClose && (
            <button
              onClick={handleClose}
              className="ml-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2 px-4 py-2 rounded-md shadow-lg text-sm",
          "animate-in fade-in-0 slide-in-from-bottom duration-300",
          getStyles(),
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {getIcon()}
        <span className="flex-1">{message}</span>
        {onClose && (
          <button
            onClick={handleClose}
            className="ml-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)
Snackbar.displayName = "Snackbar"

// Snackbar Manager for handling multiple snackbars
interface SnackbarItem extends SnackbarProps {
  id: string
}

interface SnackbarManagerProps {
  snackbars: SnackbarItem[]
  onRemove: (id: string) => void
}

export const SnackbarManager: React.FC<SnackbarManagerProps> = ({ snackbars, onRemove }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 space-y-2">
      {snackbars.map((snackbar, index) => (
        <div
          key={snackbar.id}
          style={{ transform: `translateY(${-index * 60}px)` }}
          className="transition-transform duration-300"
        >
          <Snackbar {...snackbar} onClose={() => onRemove(snackbar.id)} />
        </div>
      ))}
    </div>
  )
}

export { Snackbar }
