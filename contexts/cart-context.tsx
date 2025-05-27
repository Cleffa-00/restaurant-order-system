"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { 
  CartItem, 
  CartItemOption, 
  convertCartToOrder,
  loadCartFromStorage,
  saveCartToStorage,
  clearCartStorage,
  calculateCartSummary,
  generateCartItemId,
  areItemsIdentical
} from "@/lib/utils/cart"
import { CreateOrderRequest, OrderWithDetails } from "@/types"

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  getTotalQuantity: () => number
  getTotalPrice: () => number
  getCartSummary: () => ReturnType<typeof calculateCartSummary>
  triggerBadgeAnimation: () => void
  badgeAnimating: boolean
  // 新增：创建订单相关
  createOrderData: (customerInfo: { phone: string; name: string; customerNote?: string }) => CreateOrderRequest
  // 新增：订单提交状态
  isSubmittingOrder: boolean
  setIsSubmittingOrder: (submitting: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [badgeAnimating, setBadgeAnimating] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedItems = loadCartFromStorage()
    setItems(savedItems)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(items)
  }, [items])

  const addItem = (newItem: Omit<CartItem, "id">) => {
    setItems((prevItems) => {
      // 使用工具函数检查是否已存在相同项目
      const existingItemIndex = prevItems.findIndex(item => 
        areItemsIdentical(item, { ...newItem, id: '' })
      )

      if (existingItemIndex >= 0) {
        // 更新现有项目数量
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        }
        return updatedItems
      } else {
        // 添加新项目
        const id = generateCartItemId()
        return [...prevItems, { ...newItem, id }]
      }
    })

    triggerBadgeAnimation()
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems((prevItems) => 
      prevItems.map((item) => 
        item.id === itemId ? { ...item, quantity } : item
      )
    )

    triggerBadgeAnimation()
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
    triggerBadgeAnimation()
  }

  const clearCart = () => {
    setItems([])
    clearCartStorage()
  }

  const getTotalQuantity = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    const summary = calculateCartSummary(items)
    return summary.total
  }

  const getCartSummary = () => {
    return calculateCartSummary(items)
  }

  const createOrderData = (customerInfo: { 
    phone: string; 
    name: string; 
    customerNote?: string 
  }): CreateOrderRequest => {
    return convertCartToOrder(items, customerInfo)
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
    getCartSummary,
    triggerBadgeAnimation,
    badgeAnimating,
    createOrderData,
    isSubmittingOrder,
    setIsSubmittingOrder,
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