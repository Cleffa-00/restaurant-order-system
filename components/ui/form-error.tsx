"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FormErrorProps {
  children?: React.ReactNode
  className?: string
}

const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(({ children, className }, ref) => {
  if (!children) {
    return null
  }

  return (
    <p ref={ref} className={cn("form-error", className)} role="alert" aria-live="polite">
      {children}
    </p>
  )
})
FormError.displayName = "FormError"

export { FormError }
