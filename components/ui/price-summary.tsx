import type * as React from "react"
import { cn } from "@/lib/utils"

export interface PriceSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  subtotal: number
  tax: number
  total: number
}

export function PriceSummary({ className, subtotal, tax, total, ...props }: PriceSummaryProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Tax</span>
        <span className="text-gray-900">${tax.toFixed(2)}</span>
      </div>

      <div className="border-t border-gray-200 pt-2" />

      <div className="flex justify-between">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
      </div>
    </div>
  )
}
