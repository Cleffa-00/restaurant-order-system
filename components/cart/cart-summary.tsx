"use client"

import { useState } from "react"
import { Button } from "@/components/ui/forms/button"
import { formatCurrency } from "@/lib/utils/common"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Loader2 } from "lucide-react"

interface CartSummaryProps {
  totalPrice: number
  itemCount: number
  isVisible: boolean
  isAnimatingOut: boolean
  onCheckout: () => void | Promise<void>
  isSubmitting?: boolean
}

export function CartSummary({ 
  totalPrice, 
  itemCount, 
  isVisible, 
  isAnimatingOut, 
  onCheckout,
  isSubmitting: externalIsSubmitting = false 
}: CartSummaryProps) {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const isSubmitting = externalIsSubmitting || internalIsSubmitting

  // Completely remove from DOM when not visible and not animating
  if (!isVisible && !isAnimatingOut) return null

  const handleCheckout = async () => {
    if (itemCount === 0) return

    try {
      setInternalIsSubmitting(true)
      
      toast({
        type: "info",
        message: "Processing your order...",
        duration: 0, // Keep visible until replaced
      })
      
      await onCheckout()
      
      toast({
        type: "success",
        message: "Order placed successfully!",
        duration: 5000,
      })
    } catch (error) {
      toast({
        type: "error",
        message: "Order failed. Please try again.",
        duration: 5000,
      })
    } finally {
      setInternalIsSubmitting(false)
    }
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-out z-40 ${
        isAnimatingOut
          ? "opacity-0 translate-y-full"
          : isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full"
      }`}
      style={{
        transform: isAnimatingOut ? "translateY(100%)" : isVisible ? "translateY(0)" : "translateY(100%)",
        opacity: isAnimatingOut ? 0 : isVisible ? 1 : 0,
        // Ensure it doesn't interfere with layout when hidden
        pointerEvents: isVisible && !isAnimatingOut ? "auto" : "none",
      }}
    >
      <div className="px-4 py-3">
        {/* Items count and total price row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-600">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm font-medium">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Estimated Total</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalPrice)}</div>
          </div>
        </div>

        {/* Checkout button */}
        <Button
          onClick={handleCheckout}
          disabled={itemCount === 0 || isSubmitting}
          className="w-full py-3 text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Proceed to Checkout"
          )}
        </Button>
      </div>
    </div>
  )
}