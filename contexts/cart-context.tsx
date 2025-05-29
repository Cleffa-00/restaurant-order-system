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
// 使用 order.ts 中的完整类型定义
import { CreateOrderRequest } from "@/types/order"

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
  // 修复：创建订单相关 - 使用正确的类型
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

  // 修复：创建订单数据，返回完整的 CreateOrderRequest
  const createOrderData = (customerInfo: { 
    phone: string; 
    name: string; 
    customerNote?: string 
  }): CreateOrderRequest => {
    const cartSummary = calculateCartSummary(items)
    
    // 使用 convertCartToOrder 函数获取基础订单数据
    const baseOrderData = convertCartToOrder(items, customerInfo)
    
    // 返回包含所有必需字段的完整订单数据
    return {
      phone: customerInfo.phone,
      name: customerInfo.name,
      customerNote: customerInfo.customerNote,
      orderSource: 'web',
      // 添加价格字段
      subtotal: cartSummary.subtotal,
      taxAmount: cartSummary.taxAmount,
      serviceFee: cartSummary.serviceFee,
      total: cartSummary.total,
      // 转换商品数据格式
      items: baseOrderData.items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        note: item.note || '',
        unitPrice: baseOrderData.items.find(i => i.menuItemId === item.menuItemId)?.unitPrice || 0,
        finalPrice: baseOrderData.items.find(i => i.menuItemId === item.menuItemId)?.finalPrice || 0,
        options: item.options?.map(option => ({
          menuOptionId: option.menuOptionId,
          quantity: option.quantity,
          priceDelta: option.priceDelta,
          optionNameSnapshot: option.optionNameSnapshot,
          groupNameSnapshot: option.groupNameSnapshot
        })) || []
      }))
    }
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