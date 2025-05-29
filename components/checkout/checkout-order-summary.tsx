"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Separator } from "@/components/ui/layout/separator"
import { ShoppingBag, Info } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  options: Array<{
    optionId: string
    optionName: string
    groupName: string
    priceDelta: number
    quantity: number
  }>
  specialInstructions: string
}

interface CheckoutOrderSummaryProps {
  items: OrderItem[]
  subtotal: number
  taxes: number
  serviceFee: number
  total: number
}

export function CheckoutOrderSummary({
  items = [],
  subtotal = 0,
  taxes = 0,
  serviceFee = 0,
  total = 0,
}: CheckoutOrderSummaryProps) {
  const taxesAndFees = (taxes || 0) + (serviceFee || 0)
  const [isOpen, setIsOpen] = useState(false)
  const [isHoverDevice, setIsHoverDevice] = useState(false)

  // Detect if device supports hover
  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover)")
    setIsHoverDevice(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHoverDevice(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const handleClick = () => {
    if (!isHoverDevice) {
      setIsOpen(!isOpen)
    }
  }

  const handleMouseEnter = () => {
    if (isHoverDevice) {
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (isHoverDevice) {
      setIsOpen(false)
    }
  }

  // Calculate item total price including options
  const getItemTotal = (item: OrderItem) => {
    const basePrice = item.price || 0
    const optionsPrice = (item.options || []).reduce((sum, option) => {
      return sum + (option.priceDelta || 0) * (option.quantity || 0)
    }, 0)
    return (basePrice + optionsPrice) * (item.quantity || 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-medium">{item.name || "Unknown Item"}</h3>
                <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
              </div>
              <p className="font-medium">${getItemTotal(item).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal</span>
            <span>${(subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Taxes & Fees</span>
              <div className="relative">
                <button
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  onClick={handleClick}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  aria-label="View taxes and fees breakdown"
                >
                  <Info className="w-2.5 h-2.5 text-gray-600" />
                </button>

                {/* Custom Tooltip */}
                {isOpen && (
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap animate-in fade-in-0 zoom-in-95"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-center gap-4">
                        <span>Taxes (8.75%)</span>
                        <span className="font-mono">${(taxes || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span>Service Fee</span>
                        <span className="font-mono">${(serviceFee || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
            <span>${taxesAndFees.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xl font-bold">Total</span>
          <span className="text-2xl font-bold">${(total || 0).toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
