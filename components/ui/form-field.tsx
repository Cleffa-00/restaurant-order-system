"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  description?: string
  className?: string
  children: React.ReactNode
}

export function FormField({ label, required = false, error, description, className, children }: FormFieldProps) {
  const fieldId = React.useId()

  return (
    <div className={cn("space-y-1.5 w-full sm:space-y-2", className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium sm:text-base">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="relative w-full">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          "aria-describedby": error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined,
          "aria-invalid": error ? "true" : undefined,
          hasError: !!error,
        })}
      </div>

      {description && !error && (
        <p id={`${fieldId}-description`} className="text-xs text-muted-foreground sm:text-sm">
          {description}
        </p>
      )}

      {error && (
        <p id={`${fieldId}-error`} className="text-xs text-destructive font-medium sm:text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
