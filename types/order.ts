// types/order.ts - 订单相关类型定义

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
export type PaymentStatus = 'UNPAID' | 'PAID'

export interface OrderItemOption {
  id: string
  orderItemId: string
  menuOptionId: string
  priceDelta: number
  quantity: number
  optionNameSnapshot?: string
  groupNameSnapshot?: string
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  nameSnapshot: string
  imageUrlSnapshot?: string
  categorySnapshot?: string
  quantity: number
  note?: string
  options: OrderItemOption[]
  unitPrice: number
  finalPrice: number
}

export interface Order {
  id: string
  orderNumber: string
  phone: string
  name: string
  status: OrderStatus
  subtotal: number
  taxAmount: number
  serviceFee: number
  total: number
  paymentStatus: PaymentStatus
  orderSource?: string | null
  customerNote?: string | null
  userId?: string | null
  items: OrderItem[]
  createdAt: string // ISO string from backend
  updatedAt?: string
}

// ============================================
// 订单创建 API 请求类型
// ============================================

export interface CreateOrderRequest {
  phone: string
  name: string
  customerNote?: string
  orderSource?: string
  subtotal: number
  taxAmount: number
  serviceFee: number
  total: number
  items: CreateOrderItemRequest[]
}

export interface CreateOrderItemRequest {
  menuItemId: string
  quantity: number
  note?: string
  unitPrice: number
  finalPrice: number
  options?: CreateOrderItemOptionRequest[]
}

export interface CreateOrderItemOptionRequest {
  menuOptionId: string
  quantity: number
  priceDelta: number
  optionNameSnapshot?: string
  groupNameSnapshot?: string
}

// ============================================
// API 请求/响应类型
// ============================================

export interface GetOrdersParams {
  date?: string // YYYY-MM-DD 格式
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  page?: number
  limit?: number
  phone?: string // 添加按手机号查询
  orderNumber?: string // 添加按订单号查询
}

export interface GetOrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: PaymentStatus
}

// ============================================
// 购物车相关类型（用于前端）
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
// 订单统计类型
// ============================================

export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  unpaidOrders: number
  avgOrderValue: number
  todayOrders: number
  todayRevenue: number
}

export interface DailyOrderStats {
  date: string // YYYY-MM-DD
  orderCount: number
  revenue: number
  avgOrderValue: number
}

export interface OrderAnalytics {
  dailyStats: DailyOrderStats[]
  topItems: Array<{
    menuItemId: string
    itemName: string
    orderCount: number
    revenue: number
  }>
  statusDistribution: Array<{
    status: OrderStatus
    count: number
    percentage: number
  }>
}