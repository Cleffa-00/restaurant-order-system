# TypeScript 类型定义文档

## 📁 目录结构

```
/types/
├── index.ts        # 主类型定义文件（基础模型、请求/响应类型）
├── api.ts          # API 相关类型（路由、错误码、响应构建器）
├── hooks.ts        # React Hooks 相关类型
├── constants.ts    # 业务常量定义
└── README.md       # 本文档
```

## 📋 文件说明

### 1. `index.ts` - 主类型定义文件

包含所有基础类型定义：
- **Enums**: `OrderStatus`, `PaymentStatus`, `Role`
- **Base Models**: 与 Prisma schema 对应的模型接口
- **API Types**: 请求/响应类型定义
- **View Models**: 前端展示用的增强型模型
- **Cart Types**: 购物车相关类型
- **Utility Types**: 通用工具类型

### 2. `api.ts` - API 相关类型

专门处理 API 层的类型定义：
- **Route Handler Types**: Next.js API 路由处理器类型
- **Response Builders**: 统一的 API 响应构建器
- **Error Codes**: API 错误码枚举
- **Endpoints**: API 端点常量定义
- **Middleware Types**: 中间件相关类型

### 3. `hooks.ts` - React Hooks 类型

定义所有自定义 Hook 的返回类型和选项：
- **Auth Hooks**: `useAuth`, `useUser`
- **Data Hooks**: `useMenu`, `useOrders`, `useCart`
- **Utility Hooks**: `useDebounce`, `useLocalStorage`, `useAsync`
- **UI Hooks**: `useNotification`, `useTheme`, `useMediaQuery`

### 4. `constants.ts` - 业务常量

包含所有业务逻辑相关的常量：
- **Business Rules**: 税率、服务费、订单规则
- **Display Mappings**: 状态显示文本和颜色
- **Validation Rules**: 表单验证规则
- **Error/Success Messages**: 用户提示信息
- **UI Constants**: UI 相关常量

## 🔧 使用示例

### 基础类型使用

```typescript
import { User, Order, OrderStatus } from '@/types'

// 使用基础模型
const user: User = {
  id: '123',
  phone: '13800138000',
  password: 'hashed',
  name: '张三',
  role: Role.USER,
  createdAt: new Date()
}

// 使用枚举
const status: OrderStatus = OrderStatus.PENDING
```

### API 类型使用

```typescript
import { ApiResponseBuilder, ApiErrorCode, API_ENDPOINTS } from '@/types/api'

// 构建成功响应
return NextResponse.json(
  ApiResponseBuilder.success(data, '操作成功'),
  { status: 200 }
)

// 构建错误响应
return NextResponse.json(
  ApiResponseBuilder.error(
    '未找到订单',
    ApiErrorCode.NOT_FOUND,
    404
  ),
  { status: 404 }
)

// 使用 API 端点
const response = await fetch(API_ENDPOINTS.ORDER_BY_ID(orderId))
```

### Hook 类型使用

```typescript
import { UseCartReturn } from '@/types/hooks'

// 定义 Hook
export function useCart(): UseCartReturn {
  // ... hook 实现
  return {
    cart,
    cartItems,
    itemCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
    isInCart,
    calculateTotals
  }
}
```

### 常量使用

```typescript
import { 
  TAX_RATE, 
  ORDER_STATUS_DISPLAY,
  ERROR_MESSAGES,
  VALIDATION_RULES 
} from '@/types/constants'

// 计算税费
const taxAmount = subtotal * TAX_RATE

// 显示订单状态
const statusText = ORDER_STATUS_DISPLAY[order.status]

// 验证手机号
if (!VALIDATION_RULES.PHONE.PATTERN.test(phone)) {
  throw new Error(VALIDATION_RULES.PHONE.MESSAGE)
}
```

## 🎯 最佳实践

### 1. 类型导入

```typescript
// ✅ 推荐：使用命名导入
import { User, Order, CartItem } from '@/types'

// ❌ 避免：导入整个模块
import * as Types from '@/types'
```

### 2. 类型扩展

```typescript
// ✅ 推荐：使用接口继承
interface UserWithOrders extends User {
  orders: Order[]
  orderCount: number
}

// ✅ 推荐：使用 Omit/Pick 工具类型
type PublicUser = Omit<User, 'password'>
type UserCredentials = Pick<User, 'phone' | 'password'>
```

### 3. 类型守卫

```typescript
// 定义类型守卫函数
function isOrderStatus(value: string): value is OrderStatus {
  return Object.values(OrderStatus).includes(value as OrderStatus)
}

// 使用类型守卫
if (isOrderStatus(status)) {
  // status 的类型现在是 OrderStatus
  updateOrderStatus(status)
}
```

### 4. 泛型使用

```typescript
// 使用泛型响应类型
import { ApiResponse, PaginatedResponse } from '@/types'

async function fetchOrders(): Promise<ApiResponse<PaginatedResponse<Order>>> {
  // ...
}
```

## 📝 注意事项

1. **类型同步**: 确保类型定义与 Prisma schema 保持同步
2. **避免循环依赖**: 合理组织类型文件，避免相互引用
3. **类型导出**: 所有公共类型都应该导出
4. **命名规范**: 
   - 接口使用 PascalCase
   - 类型别名使用 PascalCase
   - 枚举使用 PascalCase
   - 常量使用 UPPER_SNAKE_CASE

## 🔄 更新流程

当 Prisma schema 更新时：

1. 运行 `npx prisma generate` 生成最新的 Prisma Client
2. 更新 `/types/index.ts` 中的基础模型定义
3. 检查并更新相关的请求/响应类型
4. 更新相关的常量定义（如果需要）
5. 运行 TypeScript 编译检查：`npm run type-check`

## 🚀 扩展建议

根据项目需求，可以添加以下类型文件：

- `types/socket.ts` - WebSocket 相关类型
- `types/analytics.ts` - 数据分析相关类型
- `types/testing.ts` - 测试相关类型
- `types/i18n.ts` - 国际化相关类型