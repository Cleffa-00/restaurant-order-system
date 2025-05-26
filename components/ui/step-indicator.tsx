"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface Step {
  id: string
  title: string
  description?: string
  optional?: boolean
}

export interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  variant?: "default" | "compact" | "vertical"
  allowClickPrevious?: boolean
}

export function StepIndicator({
  className,
  steps,
  currentStep,
  onStepClick,
  variant = "default",
  allowClickPrevious = true,
  ...props
}: StepIndicatorProps) {
  const isVertical = variant === "vertical"
  const isCompact = variant === "compact"

  const getStepStatus = (index: number) => {
    if (index < currentStep) return "completed"
    if (index === currentStep) return "current"
    return "upcoming"
  }

  const isClickable = (index: number) => {
    return onStepClick && (allowClickPrevious ? index <= currentStep : index === currentStep)
  }

  const getStepClasses = (index: number) => {
    const status = getStepStatus(index)
    const clickable = isClickable(index)

    return cn(
      "flex items-center",
      isVertical ? "flex-col text-center" : "flex-row",
      clickable && "cursor-pointer hover:opacity-80",
      !clickable && "cursor-default",
    )
  }

  const getCircleClasses = (index: number) => {
    const status = getStepStatus(index)

    return cn(
      "flex items-center justify-center rounded-full border-2 transition-colors",
      isCompact ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm",
      {
        "bg-green-500 border-green-500 text-white": status === "completed",
        "bg-blue-500 border-blue-500 text-white": status === "current",
        "bg-white border-gray-300 text-gray-500": status === "upcoming",
      },
    )
  }

  const getConnectorClasses = (index: number) => {
    const status = getStepStatus(index)

    return cn(
      "transition-colors",
      isVertical ? "w-0.5 h-8 mx-auto" : "h-0.5 flex-1",
      status === "completed" ? "bg-green-500" : "bg-gray-300",
    )
  }

  return (
    <div className={cn("flex", isVertical ? "flex-col space-y-4" : "items-center space-x-4", className)} {...props}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={getStepClasses(index)} onClick={() => isClickable(index) && onStepClick?.(index)}>
            <div className={getCircleClasses(index)}>
              {getStepStatus(index) === "completed" ? (
                <Check className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
              ) : (
                <span className="font-medium">{index + 1}</span>
              )}
            </div>

            {!isCompact && (
              <div className={cn("ml-3", isVertical && "ml-0 mt-2")}>
                <div className="text-sm font-medium text-gray-900">
                  {step.title}
                  {step.optional && <span className="text-xs text-gray-500 ml-1">(Optional)</span>}
                </div>
                {step.description && <div className="text-xs text-gray-500 mt-1">{step.description}</div>}
              </div>
            )}
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && <div className={getConnectorClasses(index)} />}
        </React.Fragment>
      ))}
    </div>
  )
}
