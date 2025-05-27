// lib/utils/cart.ts
// 购物车相关的工具函数和类型定义（修复版本）

// ============================================
// 类型定义
// ============================================

export interface CartItemOption {
  optionId: string
  optionName: string
  groupName: string
  priceDelta: number
  quantity: number
}

export interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  options: CartItemOption[]
  specialInstructions: string
}

export interface CartSummary {
  subtotal: number
  taxAmount: number
  serviceFee: number
  total: number
  itemCount: number
}

// ============================================
// 购物车计算函数（修复版本 - 添加空值保护）
// ============================================

/**
 * 计算单个购物车项目的总价
 */
export function calculateItemTotal(item: CartItem): number {
  if (!item) return 0
  
  const basePrice = (item.price || 0) * (item.quantity || 0)
  const optionsPrice = (item.options || []).reduce((sum, option) => {
    if (!option) return sum
    return sum + ((option.priceDelta || 0) * (option.quantity || 0) * (item.quantity || 0))
  }, 0)
  return basePrice + optionsPrice
}

/**
 * 计算购物车摘要信息
 */
export function calculateCartSummary(items: CartItem[]): CartSummary {
  const safeItems = items || []
  const subtotal = safeItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  const taxRate = 0.0875 // 8.75% 税率
  const taxAmount = subtotal * taxRate
  const serviceFeeRate = 0.05 // 5% 服务费
  const maxServiceFee = 0.50 // 最高 $0.50
  const serviceFee = Math.min(subtotal * serviceFeeRate, maxServiceFee)
  const total = subtotal + taxAmount + serviceFee
  const itemCount = safeItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount,
  }
}

/**
 * 格式化购物车项目选项为可读字符串
 */
export function formatItemOptions(item: CartItem): string {
  if (!item || !item.options || item.options.length === 0) return ''
  
  const optionsByGroup = item.options.reduce((acc, option) => {
    if (!option || !option.groupName) return acc
    
    if (!acc[option.groupName]) {
      acc[option.groupName] = []
    }
    acc[option.groupName].push(option)
    return acc
  }, {} as Record<string, CartItemOption[]>)

  return Object.entries(optionsByGroup)
    .map(([groupName, options]) => {
      const optionNames = options.map(opt => 
        (opt.quantity || 0) > 1 ? `${opt.optionName} (${opt.quantity})` : opt.optionName
      ).join(', ')
      return `${groupName}: ${optionNames}`
    })
    .join(' • ')
}

/**
 * 检查两个购物车项目是否相同（用于合并）
 */
export function areItemsIdentical(item1: CartItem, item2: CartItem): boolean {
  if (!item1 || !item2) return false
  
  if (
    item1.menuItemId !== item2.menuItemId ||
    item1.specialInstructions !== item2.specialInstructions ||
    (item1.options || []).length !== (item2.options || []).length
  ) {
    return false
  }

  // 检查选项是否完全相同
  const sortedOptions1 = [...(item1.options || [])].sort((a, b) => (a.optionId || '').localeCompare(b.optionId || ''))
  const sortedOptions2 = [...(item2.options || [])].sort((a, b) => (a.optionId || '').localeCompare(b.optionId || ''))

  return sortedOptions1.every((opt1, index) => {
    const opt2 = sortedOptions2[index]
    if (!opt1 || !opt2) return false
    return (
      opt1.optionId === opt2.optionId &&
      opt1.quantity === opt2.quantity
    )
  })
}

// ============================================
// LocalStorage 操作函数
// ============================================

const CART_STORAGE_KEY = 'restaurant-cart'

/**
 * 从 localStorage 加载购物车
 */
export function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error loading cart from storage:', error)
    return []
  }
}

/**
 * 保存购物车到 localStorage
 */
export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items || []))
  } catch (error) {
    console.error('Error saving cart to storage:', error)
  }
}

/**
 * 清空 localStorage 中的购物车
 */
export function clearCartStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(CART_STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing cart storage:', error)
  }
}

// ============================================
// 购物车操作辅助函数
// ============================================

/**
 * 生成唯一的购物车项目 ID
 */
export function generateCartItemId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证购物车项目数据
 */
export function validateCartItem(item: Partial<CartItem>): item is CartItem {
  return !!(
    item &&
    item.id &&
    item.menuItemId &&
    item.name &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    Array.isArray(item.options)
  )
}

/**
 * 清理无效的购物车项目
 */
export function sanitizeCartItems(items: CartItem[]): CartItem[] {
  return (items || []).filter(validateCartItem).map(item => ({
    ...item,
    quantity: Math.max(1, Math.floor(item.quantity || 0)),
    options: (item.options || []).map(option => ({
      ...option,
      quantity: Math.max(0, Math.floor(option.quantity || 0)),
    })),
  }))
}

// ============================================
// 购物车状态检查函数
// ============================================

/**
 * 检查购物车是否为空
 */
export function isCartEmpty(items: CartItem[]): boolean {
  return !items || items.length === 0
}

/**
 * 检查购物车是否达到最小订单金额
 */
export function meetsMinimumOrder(items: CartItem[], minimumAmount: number = 10): boolean {
  const { subtotal } = calculateCartSummary(items)
  return subtotal >= minimumAmount
}

/**
 * 获取购物车中特定菜品的数量
 */
export function getMenuItemQuantity(items: CartItem[], menuItemId: string): number {
  return (items || [])
    .filter(item => item && item.menuItemId === menuItemId)
    .reduce((sum, item) => sum + (item.quantity || 0), 0)
}

/**
 * 获取购物车中的唯一菜品数量
 */
export function getUniqueItemCount(items: CartItem[]): number {
  const uniqueMenuItems = new Set((items || []).map(item => item?.menuItemId).filter(Boolean))
  return uniqueMenuItems.size
}

// ============================================
// 格式化辅助函数
// ============================================

/**
 * 格式化货币
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0)
}

/**
 * 格式化项目描述（用于订单摘要）
 */
export function formatItemDescription(item: CartItem): string {
  if (!item) return ''
  
  const options = formatItemOptions(item)
  const instructions = item.specialInstructions

  let description = item.name || 'Unknown Item'
  if (options) description += ` (${options})`
  if (instructions) description += ` - ${instructions}`
  
  return description
}

// ============================================
// 订单创建辅助函数
// ============================================

/**
 * 将购物车项目转换为订单格式
 */
export function convertCartToOrder(items: CartItem[], customerInfo: {
  phone: string
  name: string
  customerNote?: string
}) {
  const summary = calculateCartSummary(items)
  
  return {
    phone: customerInfo.phone || '',
    name: customerInfo.name || '',
    customerNote: customerInfo.customerNote || '',
    orderSource: 'web',
    subtotal: summary.subtotal,
    taxAmount: summary.taxAmount,
    serviceFee: summary.serviceFee,
    total: summary.total,
    items: (items || []).map(item => ({
      menuItemId: item.menuItemId || '',
      quantity: item.quantity || 1,
      note: item.specialInstructions || '',
      unitPrice: item.price || 0,
      finalPrice: calculateItemTotal(item),
      options: (item.options || []).map(option => ({
        menuOptionId: option.optionId || '',
        quantity: option.quantity || 1,
        priceDelta: option.priceDelta || 0,
        optionNameSnapshot: option.optionName || '',
        groupNameSnapshot: option.groupName || '',
      }))
    }))
  }
}