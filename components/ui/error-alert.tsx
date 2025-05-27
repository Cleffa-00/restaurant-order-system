"use client"

import { AlertCircle, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorAlertProps {
  title?: string
  message: string
  type?: "error" | "warning" | "network"
  onDismiss?: () => void
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorAlert({ 
  title,
  message, 
  type = "error",
  onDismiss,
  onRetry,
  retryLabel = "Try Again"
}: ErrorAlertProps) {
  const getErrorConfig = () => {
    switch (type) {
      case "network":
        return {
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200", 
          iconColor: "text-orange-600",
          textColor: "text-orange-800",
          title: title || "Connection Problem"
        }
      case "warning":
        return {
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600", 
          textColor: "text-yellow-800",
          title: title || "Warning"
        }
      default:
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          textColor: "text-red-800", 
          title: title || "Error"
        }
    }
  }

  const config = getErrorConfig()

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor} animate-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>
            {message}
          </p>
          
          {onRetry && (
            <div className="mt-3">
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {retryLabel}
              </Button>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        )}
      </div>
    </div>
  )
}