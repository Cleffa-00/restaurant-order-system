"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface InlineErrorProps {
  message?: string
  className?: string
}

const InlineError: React.FC<InlineErrorProps> = ({ message, className }) => {
  if (!message) return null

  return (
    <p className={cn("text-red-500 text-sm mt-1", className)} role="alert" aria-live="polite">
      {message}
    </p>
  )
}

export { InlineError }
