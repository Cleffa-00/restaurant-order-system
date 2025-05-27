"use client"

import type React from "react"
import Image from "next/image"
import { Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"
import { CartItem, CartItemOption } from "@/lib/utils/cart"


interface CartItemCardProps {
  item: CartItem
  index: number
  isMobile: boolean
  isDeleting: boolean
  swipedItemId: string | null
  tutorialStep: "waiting" | "animating" | "complete"
  onTouchStart?: (e: React.TouchEvent, itemId: string) => void
  onTouchMove?: (e: React.TouchEvent) => void
  onTouchEnd?: (e: React.TouchEvent) => void
  onRemove: (itemId: string) => void
  getSwipeTransform: (itemId: string) => string
}

export function CartItemCard({
  item,
  index,
  isMobile,
  isDeleting,
  swipedItemId,
  tutorialStep,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onRemove,
  getSwipeTransform,
}: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCart()

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta
    if (newQuantity <= 0) {
      removeItem(item.id)
    } else {
      updateQuantity(item.id, newQuantity)
    }
  }

  // Calculate item total price including options
  const itemTotalPrice =
    (item.price + item.options.reduce((sum, opt) => sum + opt.priceDelta * opt.quantity, 0)) * item.quantity

  // Group options by group name for better display
  const groupedOptions = item.options.reduce(
    (groups, option) => {
      const groupName = option.groupName
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(option)
      return groups
    },
    {} as Record<string, CartItemOption[]>,
  )

  return (
    <div
      className={`relative transition-all duration-300 ease-out ${
        isDeleting ? "opacity-0 scale-95 translate-x-full" : "opacity-100 scale-100 translate-x-0"
      }`}
    >
      {/* Delete Button Background (mobile only, completely hidden by default) */}
      {isMobile && swipedItemId === item.id && (
        <div className="absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end pr-6 z-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(item.id)
            }}
            className="text-white hover:bg-red-600/20 h-12 w-12 rounded-full"
          >
            <Trash2 className="h-6 w-6" />
            <span className="sr-only">Delete item</span>
          </Button>
        </div>
      )}

      {/* Cart Item */}
      <div
        className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 relative z-10 hover:shadow-sm"
        style={{
          transform: getSwipeTransform(item.id),
        }}
        onTouchStart={isMobile ? (e) => onTouchStart?.(e, item.id) : undefined}
        onTouchMove={isMobile ? onTouchMove : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          {/* Item Header */}
          <div className="flex gap-3 mb-4">
            <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.imageUrl || "/placeholder.svg?height=64&width=64&text=" + encodeURIComponent(item.name)}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg mb-1 leading-tight">{item.name}</h3>
              <p className="text-gray-600 font-medium">{formatCurrency(item.price)}</p>
            </div>
            {/* Desktop delete button */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 h-8 w-8 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove item</span>
              </Button>
            )}
          </div>

          {/* Selected Options - Clean pill design */}
          {Object.keys(groupedOptions).length > 0 && (
            <div className="mb-4 space-y-3">
              {Object.entries(groupedOptions).map(([groupName, options]) => (
                <div key={groupName}>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{groupName}</div>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <div
                        key={option.optionId}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-sm"
                      >
                        <span className="text-gray-700 font-medium">
                          {option.optionName}
                          {option.quantity > 1 && <span className="text-gray-500 ml-1">×{option.quantity}</span>}
                        </span>
                        {option.priceDelta > 0 && (
                          <span className="text-green-600 font-semibold">
                            +{formatCurrency(option.priceDelta * option.quantity)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Instructions */}
          {item.specialInstructions && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-3 border-blue-300">
              <div className="text-xs font-medium text-blue-700 mb-1">Special Instructions</div>
              <p className="text-sm text-blue-600">{item.specialInstructions}</p>
            </div>
          )}

          {/* Quantity Control and Total Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Quantity</span>
              <div className="flex items-center bg-gray-50 rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleQuantityChange(-1)
                  }}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleQuantityChange(1)
                  }}
                >
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(itemTotalPrice)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
