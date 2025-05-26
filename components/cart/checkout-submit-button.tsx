"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutSubmitButtonProps {
  total: number
  isFormValid: boolean
  isSubmitting: boolean
  onSubmit: () => void
}

export function CheckoutSubmitButton({ total, isFormValid, isSubmitting, onSubmit }: CheckoutSubmitButtonProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <Button onClick={onSubmit} disabled={!isFormValid || isSubmitting} className={cn(
          "w-full h-12 bg-gray-900 text-white font-medium text-lg rounded-full",
          "hover:bg-gray-800 active:bg-gray-950 transition-all duration-200",
          "shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2"
        )}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Placing Order...
          </>
        ) : (
          `Place Order - $${total.toFixed(2)}`
        )}
      </Button>
    </div>
  )
}
