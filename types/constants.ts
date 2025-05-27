import { OrderStatus, PaymentStatus } from './index'

// ============================================
// Business Constants
// ============================================

// 税率
export const TAX_RATE = 0.0875 // 8.75%

// 服务费规则
export const SERVICE_FEE = {
  PERCENTAGE: 0.05, // 5%
  MINIMUM: 0.50    // $0.50
}

// 订单号前缀
export const ORDER_NUMBER_PREFIX = 'R'

// ============================================
// Status Display Mappings
// ============================================

export const ORDER_STATUS_DISPLAY: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.PREPARING]: 'Preparing',
  [OrderStatus.READY]: 'Ready for Pickup',
  [OrderStatus.COMPLETED]: 'Completed',
  [OrderStatus.CANCELLED]: 'Cancelled'
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'yellow',
  [OrderStatus.PREPARING]: 'blue',
  [OrderStatus.READY]: 'green',
  [OrderStatus.COMPLETED]: 'gray',
  [OrderStatus.CANCELLED]: 'red'
}

export const PAYMENT_STATUS_DISPLAY: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'Unpaid',
  [PaymentStatus.PAID]: 'Paid'
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'red',
  [PaymentStatus.PAID]: 'green'
}

// ============================================
// Validation Rules
// ============================================

export const VALIDATION_RULES = {
  PHONE: {
    PATTERN: /^1[3-9]\d{9}$/,
    MESSAGE: 'Please enter a valid phone number'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    PATTERN: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
    MESSAGE: 'Password must be at least 6 characters and contain both letters and numbers'
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
    PATTERN: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
    MESSAGE: 'Name can only contain Chinese characters, English letters, and spaces'
  },
  ORDER_NOTE: {
    MAX_LENGTH: 200,
    MESSAGE: 'Note cannot exceed 200 characters'
  }
}

// ============================================
// Pagination Defaults
// ============================================

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
}

// ============================================
// Time Constants
// ============================================

export const TIME_CONSTANTS = {
  ORDER_TIMEOUT: 30 * 60 * 1000, // 30分钟订单超时
  PAYMENT_TIMEOUT: 15 * 60 * 1000, // 15分钟支付超时
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7天会话时长
  CACHE_TTL: {
    MENU: 5 * 60, // 5分钟菜单缓存
    USER: 60 * 60, // 1小时用户缓存
    ORDER: 30 // 30秒订单缓存
  }
}

// ============================================
// Business Rules
// ============================================

export const BUSINESS_RULES = {
  MIN_ORDER_AMOUNT: 10.00, // 最低订单金额
  MAX_ORDER_ITEMS: 50, // 最大订单项数
  MAX_ITEM_QUANTITY: 99, // 单项最大数量
  DELIVERY_RADIUS: 5, // 配送半径（公里）
  BUSINESS_HOURS: {
    OPEN: '09:00',
    CLOSE: '22:00'
  }
}

// ============================================
// Error Messages
// ============================================

export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid phone number or password',
  PHONE_EXISTS: 'Phone number already registered',
  UNAUTHORIZED: 'Please login first',
  FORBIDDEN: 'Access denied',
  
  // Order
  CART_EMPTY: 'Cart is empty',
  ITEM_UNAVAILABLE: 'Item is unavailable',
  INSUFFICIENT_STOCK: 'Insufficient stock',
  ORDER_NOT_FOUND: 'Order not found',
  INVALID_ORDER_STATUS: 'Invalid order status',
  ORDER_EXPIRED: 'Order has expired',
  
  // Payment
  PAYMENT_FAILED: 'Payment failed, please try again',
  PAYMENT_CANCELLED: 'Payment cancelled',
  INVALID_PAYMENT_AMOUNT: 'Invalid payment amount',
  
  // General
  NETWORK_ERROR: 'Network error, please check your connection',
  SERVER_ERROR: 'Server error, please try again later',
  VALIDATION_ERROR: 'Invalid input',
  NOT_FOUND: 'Resource not found'
}

// ============================================
// Success Messages
// ============================================

export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  
  // Order
  ORDER_CREATED: 'Order created successfully',
  ORDER_CANCELLED: 'Order cancelled',
  ORDER_UPDATED: 'Order updated',
  
  // Payment
  PAYMENT_SUCCESS: 'Payment successful',
  
  // Cart
  ITEM_ADDED: 'Item added to cart',
  ITEM_REMOVED: 'Item removed from cart',
  CART_CLEARED: 'Cart cleared'
}

// ============================================
// UI Constants
// ============================================

export const UI_CONSTANTS = {
  TOAST_DURATION: 3000, // Toast display duration
  DEBOUNCE_DELAY: 300, // Debounce delay
  ANIMATION_DURATION: 200, // Animation duration
  SKELETON_COUNT: 6, // Skeleton screen count
  IMAGE_PLACEHOLDER: '/images/placeholder.png',
  AVATAR_PLACEHOLDER: '/images/avatar-placeholder.png'
}

// ============================================
// Regular Expressions
// ============================================

export const REGEX_PATTERNS = {
  PHONE: /^1[3-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  ORDER_NUMBER: /^R\d{6}-\d{4}$/
}

// ============================================
// API Response Codes
// ============================================

export const API_RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
}