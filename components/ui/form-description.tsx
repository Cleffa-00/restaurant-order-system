"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FormDescriptionProps {
  children?: React.ReactNode
  className?: string
}

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(({ children, className }, ref) => {
  if (!children) {
    return null
  }

  return (
    <p ref={ref} className={cn("text-sm text-gray-600", className)}>
      {children}
    </p>
  )
})
FormDescription.displayName = "FormDescription"

export { FormDescription }
