'use client'

import { useState, useEffect } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  options?: { name: string; price: number }[]
}

interface CartState {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
}

const TAX_RATE = 0.09 // 9% tax rate

export function useCart() {
  const [cart, setCart] = useState<CartState>({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0
  })
  
  // Load cart from localStorage on client
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e)
      }
    }
  }, [])
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart])
  
  // Calculate totals based on items
  const calculateTotals = (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      const itemOptionsTotal = item.options?.reduce((optSum, opt) => optSum + opt.price, 0) || 0
      const itemTotal = (item.price + itemOptionsTotal) * item.quantity
      return sum + itemTotal
    }, 0)
    
    const tax = subtotal * TAX_RATE
    const total = subtotal + tax
    
    return { subtotal, tax, total }
  }
  
  // Add an item to the cart
  const addItem = (item: CartItem) => {
    setCart(prevCart => {
      const existingIndex = prevCart.items.findIndex(i => 
        i.id === item.id && 
        JSON.stringify(i.options) === JSON.stringify(item.options)
      )
      
      let newItems
      
      if (existingIndex >= 0) {
        // Update quantity if the same item with same options exists
        newItems = [...prevCart.items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + item.quantity
        }
      } else {
        // Add as new item
        newItems = [...prevCart.items, item]
      }
      
      const { subtotal, tax, total } = calculateTotals(newItems)
      
      return {
        items: newItems,
        subtotal,
        tax,
        total
      }
    })
  }
  
  // Update the quantity of an item
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index)
      return
    }
    
    setCart(prevCart => {
      const newItems = [...prevCart.items]
      newItems[index] = { ...newItems[index], quantity }
      
      const { subtotal, tax, total } = calculateTotals(newItems)
      
      return {
        items: newItems,
        subtotal,
        tax,
        total
      }
    })
  }
  
  // Remove an item from the cart
  const removeItem = (index: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter((_, i) => i !== index)
      
      if (newItems.length === 0) {
        localStorage.removeItem('cart')
        return {
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0
        }
      }
      
      const { subtotal, tax, total } = calculateTotals(newItems)
      
      return {
        items: newItems,
        subtotal,
        tax,
        total
      }
    })
  }
  
  // Clear the entire cart
  const clearCart = () => {
    localStorage.removeItem('cart')
    setCart({
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0
    })
  }
  
  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  }
}
