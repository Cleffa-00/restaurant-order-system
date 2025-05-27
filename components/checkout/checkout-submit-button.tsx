"use client"

import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutSubmitButtonProps {
  total: number
  isFormValid: boolean
  isSubmitting: boolean
  onSubmit: () => void
  disabled?: boolean // 新增可选属性
}

export function CheckoutSubmitButton({ 
  total, 
  isFormValid, 
  isSubmitting, 
  onSubmit,
  disabled = false // 默认值为 false
}: CheckoutSubmitButtonProps) {
  const isDisabled = !isFormValid || isSubmitting || disabled

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="p-4">
        {/* Order summary bar */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <ShoppingCart className="w-4 h-4" />
            <span>Order Total</span>
          </div>
          <span className="font-semibold text-lg text-gray-900">
            ${total.toFixed(2)}
          </span>
        </div>

        {/* Submit button */}
        <Button
          onClick={onSubmit}
          disabled={isDisabled}
          className={cn(
            "w-full h-12 text-base font-semibold rounded-lg transition-all duration-200 relative overflow-hidden",
            isDisabled 
              ? "bg-gray-400 text-gray-100 cursor-not-allowed" 
              : "bg-gray-900 hover:bg-gray-800 text-white"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Processing Order...</span>
              {/* Progress bar effect */}
              <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 animate-pulse w-full" />
            </>
          ) : !isFormValid ? (
            "Complete Required Fields"
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Place Order - ${total.toFixed(2)}
            </>
          )}
        </Button>

        {/* Form validation hint */}
        {!isFormValid && !isSubmitting && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Please fill in your name and phone number to continue
          </p>
        )}
      </div>
    </div>
  )
}