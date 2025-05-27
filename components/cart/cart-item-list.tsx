"use client"

import type React from "react"

import { CartItemCard } from "./cart-item-card"
import { CartItem } from "@/lib/utils/cart"

interface CartItemListProps {
  items: CartItem[]
  isMobile: boolean
  deletingItems: Set<string>
  swipedItemId: string | null
  tutorialStep: "waiting" | "animating" | "complete"
  onTouchStart?: (e: React.TouchEvent, itemId: string) => void
  onTouchMove?: (e: React.TouchEvent) => void
  onTouchEnd?: (e: React.TouchEvent) => void
  onRemoveItem: (itemId: string) => void
  getSwipeTransform: (itemId: string) => string
}

export function CartItemList({
  items,
  isMobile,
  deletingItems,
  swipedItemId,
  tutorialStep,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onRemoveItem,
  getSwipeTransform,
}: CartItemListProps) {
  return (
    <div className="px-4 py-6 space-y-6">
      {items.map((item, index) => (
        <CartItemCard
          key={item.id}
          item={item}
          index={index}
          isMobile={isMobile}
          isDeleting={deletingItems.has(item.id)}
          swipedItemId={swipedItemId}
          tutorialStep={tutorialStep}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onRemove={onRemoveItem}
          getSwipeTransform={getSwipeTransform}
        />
      ))}
    </div>
  )
}
