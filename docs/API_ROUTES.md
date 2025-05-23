# 🔌 API Routes 设计文档（餐馆点餐系统）

本文件列出系统的所有 API 接口设计，包括路径、方法、请求参数及完整响应示例。遵循 REST 风格，管理员接口需 JWT 鉴权。

---

## 📦 菜单相关接口

### `GET /api/menu`
获取所有菜单项（含配料组和选项）

**响应：**
```json
[
  {
    "id": "menu_1",
    "name": "番茄炒蛋",
    "description": "经典家常菜",
    "price": 10.99,
    "available": true,
    "category": "热菜",
    "optionGroups": [
      {
        "id": "group_1",
        "name": "辣度",
        "required": true,
        "options": [
          { "id": "opt_1", "name": "不辣", "priceDelta": 0 },
          { "id": "opt_2", "name": "微辣", "priceDelta": 0.5 }
        ]
      }
    ]
  }
]
```

---

### `POST /api/menu`
添加新菜品（管理员）

**请求：**
```json
{
  "name": "香煎鸡排",
  "price": 18.5,
  "description": "外酥里嫩，推荐加蛋",
  "category": "主食",
  "available": true,
  "imageUrl": "https://example.com/chicken.jpg",
  "optionGroups": [
    {
      "name": "辣度",
      "required": true,
      "options": [
        { "name": "不辣", "priceDelta": 0 },
        { "name": "微辣", "priceDelta": 0.5 },
        { "name": "特辣", "priceDelta": 1.0 }
      ]
    },
    {
      "name": "附加",
      "required": false,
      "options": [
        { "name": "加蛋", "priceDelta": 1.0 },
        { "name": "加芝士", "priceDelta": 1.5 }
      ]
    }
  ]
}
```

**响应：**
```json
{
  "id": "menu_2",
  "message": "Menu item created successfully"
}
```

---

### `PATCH /api/menu/:id`
更新菜品

**请求：**
```json
{
  "name": "番茄炒蛋（升级版）",
  "price": 12.99,
  "available": false
}
```

**响应：**
```json
{ "message": "Menu item updated successfully" }
```

---

### `DELETE /api/menu/:id`
删除菜单项

**响应：**
```json
{ "message": "Menu item deleted" }
```

---

## 🛒 订单相关接口

### `POST /api/orders`
创建新订单

**请求：**
```json
{
  "name": "Alice Wang",
  "phone": "1234567890",
  "items": [
    {
      "menuItemId": "menu_1",
      "quantity": 2,
      "note": "少辣不要葱",
      "options": [
        {
          "optionName": "微辣",
          "priceDelta": 0.5
        },
        {
          "optionName": "加蛋",
          "priceDelta": 1.0
        }
      ]
    },
    {
      "menuItemId": "menu_2",
      "quantity": 1,
      "note": "",
      "options": []
    }
  ]
}
```

**响应：**
```json
{
  "orderId": "order_123",
  "stripeSessionUrl": "https://checkout.stripe.com/..."
}
```

---

### `GET /api/orders/:id`
获取订单详情（管理员）

**响应：**
```json
{
  "id": "order_123",
  "phone": "1234567890",
  "name": "Alice",
  "status": "PENDING",
  "paymentStatus": "UNPAID",
  "totalPrice": 22.98,
  "items": [
    {
      "menuItemId": "menu_1",
      "name": "番茄炒蛋",
      "quantity": 2,
      "unitPrice": 10.99,
      "note": "不要葱",
      "options": [
        { "optionName": "微辣", "priceDelta": 0.5 }
      ]
    }
  ],
  "createdAt": "2025-05-23T12:34:00Z"
}
```

---

### `PATCH /api/orders/:id`
更新订单状态

**请求：**
```json
{ "status": "IN_PROGRESS" }
```

**响应：**
```json
{ "message": "Order status updated" }
```

✅ 建议：
- 状态必须是 `"PENDING"`, `"IN_PROGRESS"`, `"COMPLETED"`, `"CANCELLED"` 中之一
- 严格校验，避免非法状态进入系统

---

## 💳 支付相关接口

### `POST /api/stripe/create-checkout`
创建 Stripe 支付链接

**请求：**
```json
{ "orderId": "order_123" }
```

**响应：**
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_123"
}
```

✅ 建议：
- 不需要其他字段，订单 ID 足够（因为订单内容已记录在 DB 中）

---

### `POST /api/stripe/webhook`
处理支付成功事件（系统自动调用）

**响应：**
```json
{ "message": "Order marked as PAID" }
```

---

## 🔐 认证相关接口

### `POST /api/auth/login`
管理员登录

**请求：**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**响应：**
```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "admin_1",
    "email": "admin@example.com"
  }
}
```

✅ 建议：
- 密码必须为明文传输，由 HTTPS 保证加密
- 不建议为空字符串或缺字段

---

## 📈 后续可拓展接口（计划阶段）

### `GET /api/revenue/stats`
返回营收数据（管理员）

**响应（示例）：**
```json
{
  "today": 350.25,
  "week": 2190.00,
  "topItems": [
    { "name": "番茄炒蛋", "sales": 50 },
    { "name": "酸辣汤", "sales": 30 }
  ]
}
```

### `GET /api/orders/search?phone=1234567890`
按手机号搜索订单

**响应：**
```json
[
  { "id": "order_123", "status": "COMPLETED", "total": 22.98 },
  { "id": "order_124", "status": "PAID", "total": 10.99 }
]
```

---

## 📌 注意事项

- 所有 JSON 请求建议在前端层处理空字符串、空数组，**避免省略字段**
- 如果你使用 TypeScript + Zod 进行校验，可以严格定义所有请求格式，避免后端判断不一致