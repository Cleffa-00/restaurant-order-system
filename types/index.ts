// ============================================
// Enums
// ============================================
export enum OrderStatus {
    PENDING = 'PENDING',
    PREPARING = 'PREPARING',
    READY = 'READY',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID'
  }
  
  export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN'
  }
  
  // ============================================
  // Base Models (与 Prisma 生成的类型保持一致)
  // ============================================
  export interface User {
    id: string
    phone: string
    password: string
    name: string | null
    role: Role
    orders?: Order[]
    createdAt: Date
  }
  
  export interface Category {
    id: string
    name: string
    slug: string
    order: number
    visible: boolean
    menuItems?: MenuItem[]
  }
  
  export interface MenuItem {
    id: string
    name: string
    description: string | null
    price: number
    imageUrl: string | null
    available: boolean
    categoryId: string | null
    category?: Category | null
    deleted: boolean
    optionGroups?: MenuOptionGroup[]
    orderItems?: OrderItem[]
    createdAt: Date
    updatedAt: Date
  }
  
  export interface MenuOptionGroup {
    id: string
    menuItemId: string
    menuItem?: MenuItem
    name: string
    required: boolean
    deleted: boolean
    options?: MenuOption[]
  }
  
  export interface MenuOption {
    id: string
    optionName: string
    priceDelta: number
    groupId: string
    group?: MenuOptionGroup
    deleted: boolean
    orderItemOptions?: OrderItemOption[]
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
    orderSource: string | null
    customerNote: string | null
    userId: string | null
    user?: User | null
    items?: OrderItem[]
    createdAt: Date
  }
  
  export interface OrderItem {
    id: string
    orderId: string
    order?: Order
    menuItemId: string
    menuItem?: MenuItem
    nameSnapshot: string
    imageUrlSnapshot: string | null
    categorySnapshot: string | null
    quantity: number
    note: string | null
    options?: OrderItemOption[]
    unitPrice: number
    finalPrice: number
  }
  
  export interface OrderItemOption {
    id: string
    orderItemId: string
    orderItem?: OrderItem
    menuOptionId: string
    menuOption?: MenuOption
    priceDelta: number
    quantity: number
    optionNameSnapshot: string | null
    groupNameSnapshot: string | null
  }
  
  // ============================================
  // API Request/Response Types
  // ============================================
  
  // User 相关
  export interface RegisterRequest {
    phone: string
    password: string
    name?: string
  }
  
  export interface LoginRequest {
    phone: string
    password: string
  }
  
  export interface LoginResponse {
    token: string
    user: Omit<User, 'password'>
  }
  
  export interface UpdateUserRequest {
    name?: string
    phone?: string
    password?: string
  }
  
  // Category 相关
  export interface CreateCategoryRequest {
    name: string
    slug: string
    order: number
    visible?: boolean
  }
  
  export interface UpdateCategoryRequest {
    name?: string
    slug?: string
    order?: number
    visible?: boolean
  }
  
  // MenuItem 相关
  export interface CreateMenuItemRequest {
    name: string
    description?: string
    price: number
    imageUrl?: string
    available?: boolean
    categoryId?: string
  }
  
  export interface UpdateMenuItemRequest {
    name?: string
    description?: string
    price?: number
    imageUrl?: string
    available?: boolean
    categoryId?: string
    deleted?: boolean
  }
  
  // MenuOption 相关
  export interface CreateMenuOptionGroupRequest {
    menuItemId: string
    name: string
    required?: boolean
    options: CreateMenuOptionRequest[]
  }
  
  export interface CreateMenuOptionRequest {
    optionName: string
    priceDelta?: number
  }
  
  // Order 相关
  export interface CreateOrderRequest {
    phone: string
    name: string
    customerNote?: string
    orderSource?: string
    items: CreateOrderItemRequest[]
  }
  
  export interface CreateOrderItemRequest {
    menuItemId: string
    quantity: number
    note?: string
    options?: CreateOrderItemOptionRequest[]
  }
  
  export interface CreateOrderItemOptionRequest {
    menuOptionId: string
    quantity: number
  }
  
  export interface UpdateOrderStatusRequest {
    status: OrderStatus
  }
  
  export interface UpdatePaymentStatusRequest {
    paymentStatus: PaymentStatus
  }
  
  // ============================================
  // View Models (用于前端展示)
  // ============================================
  
  // 带有完整关联数据的菜单项
  export interface MenuItemWithDetails extends MenuItem {
    category: Category | null
    optionGroups: MenuOptionGroupWithOptions[]
  }
  
  // 带有选项的选项组
  export interface MenuOptionGroupWithOptions extends MenuOptionGroup {
    options: MenuOption[]
  }
  
  // 带有详细信息的订单
  export interface OrderWithDetails extends Order {
    user: User | null
    items: OrderItemWithDetails[]
  }
  
  // 带有详细信息的订单项
  export interface OrderItemWithDetails extends OrderItem {
    menuItem: MenuItem
    options: OrderItemOptionWithDetails[]
  }
  
  // 带有详细信息的订单项选项
  export interface OrderItemOptionWithDetails extends OrderItemOption {
    menuOption: MenuOption
  }
  
  // ============================================
  // Cart Types (购物车相关)
  // ============================================
  
  export interface CartItem {
    menuItemId: string
    menuItem: MenuItem
    quantity: number
    note?: string
    selectedOptions: CartItemOption[]
    totalPrice: number
  }
  
  export interface CartItemOption {
    groupId: string
    groupName: string
    optionId: string
    optionName: string
    priceDelta: number
    quantity: number
  }
  
  export interface Cart {
    items: CartItem[]
    subtotal: number
    taxAmount: number
    serviceFee: number
    total: number
  }
  
  // ============================================
  // Pagination Types
  // ============================================
  
  export interface PaginationParams {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  
  export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
  
  // ============================================
  // Search/Filter Types
  // ============================================
  
  export interface MenuSearchParams {
    query?: string
    categoryId?: string
    available?: boolean
    minPrice?: number
    maxPrice?: number
    sortBy?: 'price' | 'name' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
  }
  
  export interface OrderSearchParams extends PaginationParams {
    status?: OrderStatus
    paymentStatus?: PaymentStatus
    userId?: string
    phone?: string
    startDate?: Date
    endDate?: Date
    orderNumber?: string
  }
  
  // ============================================
  // Stripe Payment Types
  // ============================================
  
  export interface CreatePaymentIntentRequest {
    orderId: string
  }
  
  export interface CreatePaymentIntentResponse {
    clientSecret: string
    orderId: string
    amount: number
  }
  
  export interface PaymentConfirmationRequest {
    orderId: string
    paymentIntentId: string
  }
  
  // ============================================
  // Analytics Types
  // ============================================
  
  export interface DashboardStats {
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    completedOrders: number
    popularItems: PopularMenuItem[]
    revenueByDay: RevenueByDay[]
  }
  
  export interface PopularMenuItem {
    menuItemId: string
    name: string
    totalQuantity: number
    totalRevenue: number
  }
  
  export interface RevenueByDay {
    date: string
    revenue: number
    orderCount: number
  }
  
  // ============================================
  // Error Types
  // ============================================
  
  export interface ApiError {
    message: string
    code: string
    statusCode: number
    details?: any
  }
  
  // ============================================
  // Auth Types
  // ============================================
  
  export interface JwtPayload {
    userId: string
    phone: string
    role: Role
    exp: number
    iat: number
  }
  
  export interface AuthContext {
    user: Omit<User, 'password'> | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (phone: string, password: string) => Promise<void>
    register: (data: RegisterRequest) => Promise<void>
    logout: () => void
    updateUser: (data: UpdateUserRequest) => Promise<void>
  }
  
  // ============================================
  // Utility Types
  // ============================================
  
  export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
  }
  
  export type ApiResponse<T> = {
    success: boolean
    data?: T
    error?: ApiError
  }
  
  export type AsyncState<T> = {
    data: T | null
    loading: boolean
    error: Error | null
  }