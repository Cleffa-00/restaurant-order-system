"use client"

import type * as React from "react"
import { cn } from "@/lib/utils/common"
import { Button } from "@/components/ui/forms/button"
import { Plus, Minus } from "lucide-react"
import { useState, useEffect } from "react"

export interface QuantitySelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  min?: number
  max?: number
  disabled?: boolean
  variant?: "default" | "compact" | "inline"
}

export function QuantitySelector({
  className,
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max,
  disabled = false,
  variant = "default",
  ...props
}: QuantitySelectorProps) {
  const [isChanging, setIsChanging] = useState(false)
  const [prevQuantity, setPrevQuantity] = useState(quantity)

  // 数量变化时的淡入淡出动画
  useEffect(() => {
    if (quantity !== prevQuantity) {
      setIsChanging(true)
      const timer = setTimeout(() => {
        setIsChanging(false)
        setPrevQuantity(quantity)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [quantity, prevQuantity])

  const canDecrease = !disabled && quantity > min
  const canIncrease = !disabled && (!max || quantity < max)

  const buttonClass = "transition-transform duration-100 active:scale-90"
  const quantityClass = cn(
    "font-medium text-gray-900 transition-opacity duration-100",
    isChanging ? "opacity-0" : "opacity-100",
  )

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)} {...props}>
        <Button
          variant="outline"
          size="icon"
          className={cn("h-6 w-6", buttonClass)}
          onClick={onDecrease}
          disabled={!canDecrease}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className={cn("w-8 text-center text-sm", quantityClass)}>{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className={cn("h-6 w-6", buttonClass)}
          onClick={onIncrease}
          disabled={!canIncrease}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center bg-gray-50 rounded-lg", className)} {...props}>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 hover:bg-gray-100 rounded-lg", buttonClass)}
          onClick={onDecrease}
          disabled={!canDecrease}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className={cn("w-8 text-center font-semibold", quantityClass)}>{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 hover:bg-gray-100 rounded-lg", buttonClass)}
          onClick={onIncrease}
          disabled={!canIncrease}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Button
        variant="outline"
        size="icon"
        className={cn("h-8 w-8", buttonClass)}
        onClick={onDecrease}
        disabled={!canDecrease}
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Decrease quantity</span>
      </Button>
      <span className={cn("w-8 text-center", quantityClass)}>{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className={cn("h-8 w-8", buttonClass)}
        onClick={onIncrease}
        disabled={!canIncrease}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  )
}
