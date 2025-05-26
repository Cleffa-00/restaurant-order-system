"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface LoadingOverlayProps {
  isLoading: boolean
  fullscreen?: boolean
  message?: string
  className?: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, fullscreen = false, message, className }) => {
  if (!isLoading) return null

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-white/60 backdrop-blur-sm z-40",
        fullscreen ? "fixed inset-0" : "absolute inset-0",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Spinner */}
        <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />

        {/* Optional message */}
        {message && <p className="text-sm text-gray-600 font-medium">{message}</p>}
      </div>
    </div>
  )
}

export { LoadingOverlay }
