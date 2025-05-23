# 🔌 API Routes 设计文档（餐馆点餐系统）

本文件列出系统的所有 API 接口设计，包括用途、路径、请求方法、预期参数与响应结构。所有接口遵循 REST 风格，管理员相关接口需鉴权。

---

## 📦 菜单相关接口

### `GET /api/menu`
获取所有菜单项（含配料组和选项）。

**响应示例：**
```json
[
  {
    "id": "menu_1",
    "name": "番茄炒蛋",
    "price": 10.99,
    "available": true,
    "optionGroups": [
      {
        "name": "辣度",
        "required": true,
        "options": [
          { "name": "不辣", "priceDelta": 0 },
          { "name": "微辣", "priceDelta": 0.5 }
        ]
      }
    ]
  }
]
```

---

### `POST /api/menu`
创建新菜品（需管理员身份）

### `PATCH /api/menu/:id`
更新菜单项信息

### `DELETE /api/menu/:id`
删除菜单项

---

## 🛒 订单相关接口

### `POST /api/orders`
创建新订单（含手机号、备注、所选菜品与选项）

**请求示例：**
```json
{
  "name": "Alice",
  "phone": "1234567890",
  "items": [
    {
      "menuItemId": "menu_1",
      "quantity": 2,
      "note": "少辣",
      "options": [
        { "optionName": "微辣", "priceDelta": 0.5 }
      ]
    }
  ]
}
```

**响应：**
```json
{ "orderId": "order_123", "stripeSessionUrl": "https://checkout.stripe.com/..." }
```

---

### `GET /api/orders/:id`
获取订单详情（仅管理员）

### `PATCH /api/orders/:id`
更新订单状态（如：制作中、已完成）

---

## 💳 支付相关接口

### `POST /api/stripe/create-checkout`
创建 Stripe Checkout 支付会话（由 `/api/orders` 调用）

### `POST /api/stripe/webhook`
接收 Stripe 回调，更新订单状态为已支付

---

## 🔐 认证相关接口

### `POST /api/auth/login`
管理员登录，返回 JWT Token

**请求：**
```json
{ "email": "admin@example.com", "password": "****" }
```

**响应：**
```json
{ "token": "JWT_TOKEN" }
```

---

## ✅ 后续可扩展接口（计划阶段）

- `GET /api/revenue/stats`：返回当日/当月营收统计
- `GET /api/orders/search?phone=xxx`：手机号搜索订单