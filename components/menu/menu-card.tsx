"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QuantitySelector } from "@/components/ui/quantity-selector"
import { cn } from "@/lib/utils"
import { MenuItemWithDetails } from "@/types"

interface MenuCardProps {
  item: MenuItemWithDetails
  onClick: () => void
  onCartAnimation?: (element: HTMLElement, isDecrease?: boolean) => void
}

export function MenuCard({ item, onClick, onCartAnimation }: MenuCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isQuantityAnimating, setIsQuantityAnimating] = useState(false)
  const { addItem, items: cartItems, updateQuantity, removeItem } = useCart()
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Check if item has customization options
  const hasOptions = item.optionGroups && item.optionGroups.length > 0

  // Find existing cart items for this menu item (including customized ones)
  const existingCartItems = cartItems.filter((cartItem) => cartItem.menuItemId === item.id)

  // For items without options, find the basic version
  const basicCartItem = !hasOptions
    ? existingCartItems.find((cartItem) => cartItem.options.length === 0 && cartItem.specialInstructions === "")
    : null

  // For items with options, get total quantity across all variations
  const totalQuantity = hasOptions
    ? existingCartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
    : basicCartItem?.quantity || 0

  const triggerFlyingAnimation = (isDecrease = false) => {
    if (!onCartAnimation || !imageRef.current) return

    const imageElement = imageRef.current
    const rect = imageElement.getBoundingClientRect()

    // Find cart button
    const cartButton =
      document.querySelector("[data-cart-button]") ||
      document.querySelector('button[aria-label*="cart"]') ||
      document.querySelector('button svg[class*="shopping"]')?.closest("button")

    if (!cartButton) {
      console.warn("Cart button not found for animation")
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
    ghost.style.transition = isDecrease
      ? "all 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53)"
      : "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
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
    setTimeout(
      () => {
        if (document.body.contains(ghost)) {
          document.body.removeChild(ghost)
        }
      },
      isDecrease ? 600 : 800,
    )

    // Trigger cart icon animation
    if (onCartAnimation) {
      onCartAnimation(imageElement, isDecrease)
    }
  }

  // ✅ 纯业务逻辑函数 - 直接加入购物车（无事件处理）
  const addToCartDirect = () => {
    if (hasOptions) {
      onClick()
      return
    }

    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || "",
      quantity: 1,
      options: [],
      specialInstructions: "",
    })

    triggerFlyingAnimation(false)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)
  }

  // ✅ 处理按钮点击（带事件参数，用于阻止冒泡）
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCartDirect()
  }

  // ✅ QuantitySelector 使用的增加函数（无参数）
  const handleQuantityIncrease = () => {
    if (hasOptions) {
      onClick()
      return
    }

    if (!basicCartItem) {
      addToCartDirect()
      return
    }

    updateQuantity(basicCartItem.id, basicCartItem.quantity + 1)
    triggerFlyingAnimation(false)
  }

  // ✅ QuantitySelector 使用的减少函数（无参数）
  const handleQuantityDecrease = () => {
    if (!basicCartItem) return

    const newQuantity = basicCartItem.quantity - 1

    if (newQuantity <= 0) {
      removeItem(basicCartItem.id)
      if (onCartAnimation) {
        onCartAnimation(imageRef.current!, true)
      }
      setIsQuantityAnimating(true)
      setTimeout(() => setIsQuantityAnimating(false), 300)
    } else {
      updateQuantity(basicCartItem.id, newQuantity)
      if (onCartAnimation) {
        onCartAnimation(imageRef.current!, true)
      }
    }
  }

  // ✅ 处理卡片整体点击
  const handleCardClick = () => {
    if (!item.available) return

    if (totalQuantity === 0) {
      // 没有数量时：有选项打开modal，无选项直接加购物车
      if (hasOptions) {
        onClick()
      } else {
        addToCartDirect()
      }
    } else {
      // 有数量时：总是打开modal
      onClick()
    }
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        "group flex flex-row w-full",
        "h-[136px] sm:h-[160px] md:h-[180px]",
        "bg-white border border-gray-100 rounded-xl overflow-hidden p-0 transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-gray-100/50 hover:border-gray-200 hover:-translate-y-0.5",
        isAnimating && "scale-[1.02]",
        !item.available && "cursor-not-allowed opacity-60",
        item.available && "cursor-pointer",
      )}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative w-[136px] h-[136px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] overflow-hidden rounded-xl shrink-0">
        {!imageError ? (
          <Image
            ref={imageRef}
            src={item.imageUrl || "/placeholder.svg?height=300&width=400&text=" + encodeURIComponent(item.name)}
            alt={item.name}
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {!item.available && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <span className="text-white text-xs font-medium px-2 py-0.5 bg-black/60 rounded-full">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between px-4 py-3 sm:px-5 sm:py-4 md:px-8 md:py-6 h-full">
        {/* Top Section: name + options */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg leading-tight truncate">
            {item.name}
          </h3>
          {hasOptions && (
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              {item.optionGroups?.length || 0} customization option{(item.optionGroups?.length || 0) !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Bottom Section: price (left) + button (right) */}
        <div className="flex justify-between items-end mt-4 gap-3">
          <div className="text-base sm:text-lg md:text-xl font-bold text-gray-900 tracking-tight">
            {formatCurrency(item.price)}
          </div>

          {/* Right Button */}
          {item.available &&
            (totalQuantity === 0 ? (
              hasOptions ? (
                <Button
                  onClick={handleButtonClick}
                  className={cn(
                    "bg-gray-900 text-white font-medium h-7 sm:h-8 md:h-9 px-3 sm:px-4 md:px-5 text-[13px] sm:text-sm md:text-base rounded-full",
                    "hover:bg-gray-800 active:bg-gray-950 transition-all duration-200",
                    "shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2",
                    "shrink-0 max-w-[110px] truncate"
                  )}
                >
                  Customize
                </Button>
              ) : (
                <Button
                  onClick={handleButtonClick}
                  className={cn(
                    "bg-gray-900 text-white font-medium w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-lg sm:text-xl md:text-2xl rounded-full flex items-center justify-center p-0 leading-none",
                    "hover:bg-gray-800 active:bg-gray-950 transition-all duration-200",
                    "shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2",
                    "pb-[1px]"
                  )}
                >
                  +
                </Button>
              )
            ) : hasOptions ? (
              <div className="bg-gray-100 text-gray-900 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border border-gray-200 flex items-center justify-center">
                <span className="font-semibold text-sm">{totalQuantity}</span>
              </div>
            ) : (
              <div
                className={cn(
                  "transition-all duration-300",
                  isQuantityAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100",
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <QuantitySelector
                  quantity={totalQuantity}
                  onIncrease={handleQuantityIncrease}
                  onDecrease={handleQuantityDecrease}
                  min={0}
                  variant="inline"
                />
              </div>
            ))}
        </div>
      </div>
    </Card>
  )
}