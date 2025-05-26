"use client"

import * as React from "react"
import { Snackbar } from "./snackbar"
import { cn } from "@/lib/utils"

export interface ToastItem {
  id: string
  message: string
  type?: "success" | "error" | "info"
  duration?: number
}

export interface ToastManagerProps {
  snackbars: ToastItem[]
  onRemove: (id: string) => void
  className?: string
  pauseOnHover?: boolean
  maxVisible?: number
  position?: "top-right" | "bottom-center"
}

const ToastManager = React.forwardRef<HTMLDivElement, ToastManagerProps>(
  ({ snackbars, onRemove, className, pauseOnHover = true, maxVisible = 3, position = "bottom-center" }, ref) => {
    const [hoveredToasts, setHoveredToasts] = React.useState<Set<string>>(new Set())

    // 限制显示数量
    const visibleSnackbars = snackbars.slice(0, maxVisible)

    const handleMouseEnter = (id: string) => {
      if (pauseOnHover) {
        setHoveredToasts((prev) => new Set(prev).add(id))
      }
    }

    const handleMouseLeave = (id: string) => {
      if (pauseOnHover) {
        setHoveredToasts((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }
    }

    const getPositionClasses = () => {
      switch (position) {
        case "top-right":
          return "fixed top-4 right-4 z-50"
        case "bottom-center":
          return "fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        default:
          return "fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      }
    }

    const getStackDirection = () => {
      return position === "top-right" ? "flex-col" : "flex-col-reverse"
    }

    if (visibleSnackbars.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(getPositionClasses(), "flex gap-2 pointer-events-none", getStackDirection(), className)}
      >
        {visibleSnackbars.map((snackbar, index) => {
          const isHovered = hoveredToasts.has(snackbar.id)

          return (
            <div
              key={snackbar.id}
              className={cn(
                "pointer-events-auto transition-all duration-300 ease-out",
                // 堆叠效果：后面的toast稍微缩小和偏移
                index > 0 && position === "bottom-center" && "transform scale-95 opacity-80",
                index > 0 && position === "top-right" && "transform scale-95 opacity-80",
              )}
              style={{
                // 为堆叠的toast添加z-index
                zIndex: visibleSnackbars.length - index,
                // 堆叠偏移
                transform: index > 0 ? `translateY(${index * -8}px) scale(${1 - index * 0.05})` : undefined,
              }}
              onMouseEnter={() => handleMouseEnter(snackbar.id)}
              onMouseLeave={() => handleMouseLeave(snackbar.id)}
            >
              <ToastItem {...snackbar} onRemove={onRemove} isPaused={isHovered} />
            </div>
          )
        })}

        {/* 显示剩余数量提示 */}
        {snackbars.length > maxVisible && (
          <div
            className={cn(
              "pointer-events-auto",
              "bg-gray-600 text-white text-xs px-3 py-1 rounded-full",
              "animate-in fade-in-0 slide-in-from-bottom duration-300",
            )}
          >
            +{snackbars.length - maxVisible} 更多
          </div>
        )}
      </div>
    )
  },
)
ToastManager.displayName = "ToastManager"

// 单个Toast项组件
interface ToastItemProps extends ToastItem {
  onRemove: (id: string) => void
  isPaused?: boolean
}

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  message,
  type = "info",
  duration = 3000,
  onRemove,
  isPaused = false,
}) => {
  const [isVisible, setIsVisible] = React.useState(true)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = React.useRef<number>(Date.now())
  const remainingTimeRef = React.useRef<number>(duration)

  const startTimer = React.useCallback(() => {
    if (duration > 0 && !isPaused) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onRemove(id), 300) // 等待退出动画
      }, remainingTimeRef.current)
    }
  }, [duration, isPaused, onRemove, id])

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
    setTimeout(() => onRemove(id), 300)
  }

  return (
    <Snackbar
      message={message}
      type={type}
      duration={0} // 由ToastItem管理定时器
      onClose={handleClose}
      className={cn(
        "relative",
        isVisible
          ? "animate-in fade-in-0 slide-in-from-bottom duration-300"
          : "animate-out fade-out-0 slide-out-to-bottom duration-300",
      )}
    />
  )
}

// Hook for managing toasts
export const useToastManager = () => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const addToast = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearAllToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  const showSuccess = React.useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: "success", duration })
    },
    [addToast],
  )

  const showError = React.useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: "error", duration })
    },
    [addToast],
  )

  const showInfo = React.useCallback(
    (message: string, duration?: number) => {
      return addToast({ message, type: "info", duration })
    },
    [addToast],
  )

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showInfo,
  }
}

export { ToastManager }
