"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useCart } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"
import { MenuItemWithDetails } from "@/types"
import { QuantitySelector } from "@/components/ui/quantity-selector"

interface SelectedOption {
  optionId: string
  quantity: number
}

interface MenuItemModalProps {
  item: MenuItemWithDetails | null
  isOpen: boolean
  onClose: () => void
  onCartAnimation?: (element: HTMLElement, isDecrease?: boolean) => void
}

export function MenuItemModal({ item, isOpen, onClose, onCartAnimation }: MenuItemModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, SelectedOption[]>>({})
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [totalPrice, setTotalPrice] = useState(0)
  const { addItem } = useCart()
  const imageRef = useRef<HTMLImageElement>(null)

  // Reset state when modal opens with a new item
  useEffect(() => {
    if (item) {
      // Initialize selected options
      const initialOptions: Record<string, SelectedOption[]> = {}
      item.optionGroups?.forEach((group) => {
        if (group.required && group.options && group.options.length > 0) {
          // Pre-select first option for required groups
          initialOptions[group.id] = [{ optionId: group.options[0].id, quantity: 1 }]
        } else {
          // Initialize empty array for non-required groups
          initialOptions[group.id] = []
        }
      })
      setSelectedOptions(initialOptions)
      setSpecialInstructions("")

      // Calculate initial total price (for single item)
      calculateTotalPrice(item, initialOptions)
    }
  }, [item])

  // Calculate total price based on selected options (for single item)
  const calculateTotalPrice = (menuItem: MenuItemWithDetails, options: Record<string, SelectedOption[]>) => {
    if (!menuItem) return 0

    let price = menuItem.price

    // Add price deltas from selected options
    Object.entries(options).forEach(([groupId, selectedOpts]) => {
      const group = menuItem.optionGroups?.find((g) => g.id === groupId)
      if (group && group.options) {
        selectedOpts.forEach((selectedOpt) => {
          const option = group.options?.find((o) => o.id === selectedOpt.optionId)
          if (option) {
            price += option.priceDelta * selectedOpt.quantity
          }
        })
      }
    })

    setTotalPrice(price)
    return price
  }

  // Handle radio button change (required groups)
  const handleRadioChange = (groupId: string, optionId: string) => {
    const newSelectedOptions = {
      ...selectedOptions,
      [groupId]: [{ optionId, quantity: 1 }],
    }
    setSelectedOptions(newSelectedOptions)
    if (item) calculateTotalPrice(item, newSelectedOptions)
  }

  // Handle quantity change for non-required options
  const handleQuantityChange = (groupId: string, optionId: string, delta: number) => {
    const currentOptions = [...(selectedOptions[groupId] || [])]
    const existingIndex = currentOptions.findIndex((opt) => opt.optionId === optionId)

    if (existingIndex >= 0) {
      const newQuantity = currentOptions[existingIndex].quantity + delta
      if (newQuantity <= 0) {
        // Remove the option if quantity becomes 0
        currentOptions.splice(existingIndex, 1)
      } else {
        // Update the quantity
        currentOptions[existingIndex].quantity = newQuantity
      }
    } else if (delta > 0) {
      // Add new option with quantity 1
      currentOptions.push({ optionId, quantity: 1 })
    }

    const newSelectedOptions = {
      ...selectedOptions,
      [groupId]: currentOptions,
    }

    setSelectedOptions(newSelectedOptions)
    if (item) calculateTotalPrice(item, newSelectedOptions)
  }

  // Get quantity for a specific option
  const getOptionQuantity = (groupId: string, optionId: string): number => {
    const groupOptions = selectedOptions[groupId] || []
    const option = groupOptions.find((opt) => opt.optionId === optionId)
    return option?.quantity || 0
  }

  // Trigger flying animation from modal image to cart
  const triggerFlyingAnimation = () => {
    if (!onCartAnimation || !imageRef.current) return

    const imageElement = imageRef.current
    const rect = imageElement.getBoundingClientRect()

    // Find cart button
    const cartButton =
      document.querySelector("[data-cart-button]") ||
      document.querySelector('button[aria-label*="cart"]') ||
      document.querySelector('button svg[class*="shopping"]')?.closest("button")

    if (!cartButton) {
      return
    }

    const cartRect = cartButton.getBoundingClientRect()

    // Create ghost image
    const ghost = document.createElement("div")
    ghost.style.position = "fixed"
    ghost.style.top = `${rect.top}px`
    ghost.style.left = `${rect.left}px`
    ghost.style.width = `${rect.width}px`
    ghost.style.height = `${rect.height}px`
    ghost.style.zIndex = "9999"
    ghost.style.pointerEvents = "none"
    ghost.style.borderRadius = "8px"
    ghost.style.overflow = "hidden"
    ghost.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    ghost.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"

    // Clone the image
    const ghostImage = imageElement.cloneNode(true) as HTMLImageElement
    ghostImage.style.width = "100%"
    ghostImage.style.height = "100%"
    ghostImage.style.objectFit = "cover"
    ghost.appendChild(ghostImage)

    document.body.appendChild(ghost)

    // Calculate trajectory to cart icon center
    const cartCenterX = cartRect.left + cartRect.width / 2
    const cartCenterY = cartRect.top + cartRect.height / 2
    const imageCenterX = rect.left + rect.width / 2
    const imageCenterY = rect.top + rect.height / 2

    // Animate to cart
    requestAnimationFrame(() => {
      ghost.style.transform = `translate(${cartCenterX - imageCenterX}px, ${cartCenterY - imageCenterY}px) scale(0.1)`
      ghost.style.opacity = "0"
    })

    // Remove ghost element
    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost)
      }
    }, 800)

    // Trigger cart icon animation
    if (onCartAnimation) {
      onCartAnimation(imageElement, false)
    }
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (item) {
      // Convert selected options to cart format with proper naming
      const cartOptions = Object.entries(selectedOptions)
        .flatMap(([groupId, groupOptions]) => {
          const group = item.optionGroups?.find((g) => g.id === groupId)
          if (!group || !group.options) return []

          return groupOptions
            .map((selectedOpt) => {
              const option = group.options?.find((o) => o.id === selectedOpt.optionId)
              if (!option) return null

              return {
                optionId: option.id,
                optionName: option.optionName,
                groupName: group.name,
                priceDelta: option.priceDelta,
                quantity: selectedOpt.quantity,
              }
            })
            .filter(Boolean)
        })
        .filter((opt): opt is NonNullable<typeof opt> => opt !== null)

      // Create the cart item with the properly formatted options
      const cartItem = {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl || "",
        quantity: 1,
        options: cartOptions,
        specialInstructions,
      }

      // Add item to cart
      addItem(cartItem)

      // Trigger flying animation
      triggerFlyingAnimation()

      // Close modal after a short delay to allow animation to start
      setTimeout(() => {
        onClose()
      }, 100)
    }
  }

  // If modal is closed or no item, don't render
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal - ✅ 响应式容器尺寸 */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-sm sm:max-w-md md:max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Close button - ✅ 响应式按钮 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 transition-colors"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Image - ✅ 响应式高度 */}
        <div className="relative h-40 sm:h-48 md:h-56 bg-gray-100">
          <Image
            ref={imageRef}
            src={item.imageUrl || "/placeholder.svg?height=300&width=400&text=" + encodeURIComponent(item.name)}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Content - ✅ 响应式内边距 */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {/* Item details - ✅ 响应式文字尺寸 */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{item.name}</h2>
          <p className="text-gray-600 mt-1 mb-3 text-sm sm:text-base">{item.description || ""}</p>
          <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-4">{formatCurrency(item.price)}</p>

          {/* Option groups */}
          {item.optionGroups && item.optionGroups.length > 0 ? (
            <div className="space-y-4 sm:space-y-6 mb-6">
              {item.optionGroups.map((group) => (
                <div key={group.id} className="border-t pt-3 sm:pt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
                    {group.name}
                    {group.required && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                        Required
                      </span>
                    )}
                  </h3>

                  {group.required ? (
                    // Radio buttons for required groups
                    <RadioGroup
                      value={selectedOptions[group.id]?.[0]?.optionId || ""}
                      onValueChange={(value) => handleRadioChange(group.id, value)}
                      className="space-y-2"
                    >
                      {group.options?.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2 sm:space-x-3">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer text-gray-900 text-sm sm:text-base">
                            {option.optionName}
                          </Label>
                          {option.priceDelta > 0 && (
                            <span className="text-sm sm:text-base font-medium text-gray-900">
                              +{formatCurrency(option.priceDelta)}
                            </span>
                          )}
                        </div>
                      )) || []}
                    </RadioGroup>
                  ) : (
                    // Quantity controls for optional groups - ✅ 使用 QuantitySelector
                    <div className="space-y-2 sm:space-y-3">
                      {group.options?.map((option) => {
                        const optionQuantity = getOptionQuantity(group.id, option.id)
                        return (
                          <div key={option.id} className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-900 text-sm sm:text-base">{option.optionName}</span>
                              {option.priceDelta > 0 && (
                                <span className="ml-2 text-sm sm:text-base font-medium text-gray-900">
                                  +{formatCurrency(option.priceDelta)}
                                </span>
                              )}
                            </div>
                            {/* ✅ 使用 QuantitySelector 替代原来的按钮 */}
                            <QuantitySelector
                              quantity={optionQuantity}
                              onIncrease={() => handleQuantityChange(group.id, option.id, 1)}
                              onDecrease={() => handleQuantityChange(group.id, option.id, -1)}
                              min={0}
                              variant="inline"
                            />
                          </div>
                        )
                      }) || []}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border-t my-4"></div>
          )}

          {/* Special instructions - 暂时注释掉
          <div className="mb-6">
            <Label htmlFor="special-instructions" className="block mb-2 text-sm sm:text-base font-semibold text-gray-900">
              Special Instructions
            </Label>
            <Textarea
              id="special-instructions"
              placeholder="Any special requests or allergies?"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full text-gray-900 text-sm sm:text-base"
            />
          </div>
          */}
        </div>

        {/* Footer with Add to Cart button - ✅ 响应式按钮 */}
        <div className="border-t p-3 sm:p-4 md:p-6 bg-white">
          <Button
            onClick={handleAddToCart}
            className={cn(
              "w-full bg-gray-900 text-white font-medium rounded-full transition-all duration-200",
              "h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6 text-sm sm:text-base md:text-lg",
              "hover:bg-gray-800 active:bg-gray-950",
              "shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2"
            )}
          >
            Add to Cart – {formatCurrency(totalPrice)}
          </Button>
        </div>
      </div>
    </div>
  )
}