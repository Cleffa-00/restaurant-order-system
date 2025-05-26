"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface CartOption {
  optionId: string
  optionName: string
  groupName: string
  priceDelta: number
  quantity: number
}

interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  options: CartOption[]
  specialInstructions: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  getTotalQuantity: () => number
  getTotalPrice: () => number
  triggerBadgeAnimation: () => void
  badgeAnimating: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [badgeAnimating, setBadgeAnimating] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("restaurant-cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("restaurant-cart", JSON.stringify(items))
  }, [items])

  const addItem = (newItem: Omit<CartItem, "id">) => {
    setItems((prevItems) => {
      // Check if item with same options already exists
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.menuItemId === newItem.menuItemId &&
          JSON.stringify(item.options) === JSON.stringify(newItem.options) &&
          item.specialInstructions === newItem.specialInstructions,
      )

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        }
        return updatedItems
      } else {
        // Add new item
        const id = `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        return [...prevItems, { ...newItem, id }]
      }
    })

    // Trigger badge animation
    triggerBadgeAnimation()
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))

    // Trigger badge animation for quantity updates
    triggerBadgeAnimation()
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))

    // Trigger badge animation for removals
    triggerBadgeAnimation()
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalQuantity = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const optionsPrice = item.options.reduce((sum, option) => sum + option.priceDelta * option.quantity, 0)
      return total + (item.price + optionsPrice) * item.quantity
    }, 0)
  }

  const triggerBadgeAnimation = () => {
    setBadgeAnimating(true)
    setTimeout(() => setBadgeAnimating(false), 600)
  }

  const value: CartContextType = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalQuantity,
    getTotalPrice,
    triggerBadgeAnimation,
    badgeAnimating,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
