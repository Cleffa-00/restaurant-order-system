"use client"

import React from "react"

import { Menu, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useState, useRef } from "react"

interface MenuHeaderProps {
  onMenuClick: () => void
  onCartClick?: () => void
  showMenuButton?: boolean
}

export function MenuHeader({ onMenuClick, onCartClick = () => {}, showMenuButton = true }: MenuHeaderProps) {
  const { getTotalQuantity, badgeAnimating } = useCart()
  const [isShaking, setIsShaking] = useState(false)
  const cartButtonRef = useRef<HTMLButtonElement>(null)
  const totalQuantity = getTotalQuantity()

  // Function to trigger cart icon animation (can be called from parent)
  const triggerCartAnimation = (isDecrease = false) => {
    if (isDecrease) {
      // For decrease: only shake the cart icon and badge, no flying animation
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)

      // Additional badge animation for decrease
      if (cartButtonRef.current) {
        const badge = cartButtonRef.current.querySelector("[data-cart-badge]")
        if (badge) {
          badge.classList.add("animate-pulse")
          setTimeout(() => {
            badge.classList.remove("animate-pulse")
          }, 300)
        }
      }
    } else {
      // For increase: normal shake animation
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 600)
    }
  }

  // Expose the animation function to parent components
  React.useImperativeHandle(
    cartButtonRef,
    () => ({
      triggerAnimation: triggerCartAnimation,
    }),
    [],
  )

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}

          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Menu</h1>
        </div>

        <div className="relative">
          <Button
            ref={cartButtonRef}
            variant="ghost"
            size="icon"
            onClick={onCartClick}
            data-cart-button
            className={`transition-transform duration-150 ${isShaking ? "animate-pulse scale-110" : ""}`}
          >
            <ShoppingCart className="h-10 w-10 text-gray-900" />
            <span className="sr-only">Shopping cart</span>
          </Button>

          {/* Enhanced Cart Badge */}
          {totalQuantity > 0 && (
            <div className="absolute top-0 right-0 translate-x-3 -translate-y-3 w-5 h-5">
              {/* ✅ 动画层：扩散动画不遮挡 icon */}
              {isShaking && (
                <span className="absolute inset-0 rounded-full bg-red-500 opacity-60 animate-ping z-0"></span>
              )}

              {/* ✅ badge 本体：显示数字、始终在最上层 */}
              <div
                data-cart-badge
                className={`relative z-10 w-full h-full rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-md transition-all duration-300 ${
                  badgeAnimating ? "animate-bounce scale-110" : "scale-100"
                }`}
                style={{
                  minWidth: totalQuantity > 9 ? "20px" : "20px",
                  fontSize: totalQuantity > 99 ? "10px" : "12px",
                  fontWeight: "bold",
                }}
              >
                {totalQuantity > 99 ? "99+" : totalQuantity}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
