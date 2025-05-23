# 🧪 API 请求与响应示例参考（API_REQUEST_EXAMPLES.md）

---

## ✅ 登录接口示例

### 请求：
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

### 响应：
```json
{
  "token": "xxx.yyy.zzz",
  "user": {
    "id": "user_abc",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

---

## ✅ 创建订单请求

### 请求：
```json
{
  "name": "李四",
  "phone": "12345678900",
  "note": "备注：去辣",
  "items": [
    {
      "menuItemId": "item_123",
      "quantity": 1,
      "note": "少盐",
      "options": [
        { "groupName": "辣度", "optionName": "不辣", "priceDelta": 0 },
        { "groupName": "配料", "optionName": "加蛋", "priceDelta": 1.0 }
      ]
    },
    {
      "menuItemId": "item_456",
      "quantity": 2,
      "note": "",
      "options": [
        { "groupName": "辣度", "optionName": "中辣", "priceDelta": 0.5 }
      ]
    }
  ]
}
```

---

## ✅ 订单详情响应（GET /api/orders/:id）

### 响应：
```json
{
  "id": "order_abc",
  "name": "李四",
  "phone": "12345678900",
  "status": "PENDING",
  "paymentStatus": "UNPAID",
  "user": {
    "id": "user_xyz",
    "name": "李四",
    "role": "CUSTOMER"
  },
  "items": [
    {
      "menuItemName": "宫保鸡丁",
      "menuItemImage": "https://cdn.example.com/img.png",
      "menuItemCategory": "热菜",
      "quantity": 1,
      "note": "少盐",
      "unitPrice": 18.0,
      "options": [
        { "groupName": "辣度", "optionName": "不辣", "priceDelta": 0 },
        { "groupName": "配料", "optionName": "加蛋", "priceDelta": 1.0 }
      ]
    }
  ]
}
```

---

## ✅ 支付回调（Stripe Webhook）

```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_abc123",
      "metadata": {
        "orderId": "order_abc"
      },
      "payment_status": "paid"
    }
  }
}
```

---

## ✅ 修改订单状态（后台）

### 请求（PATCH /api/orders/:id/status）：
```json
{
  "status": "IN_PROGRESS",
  "paymentStatus": "PAID"
}
```

---

## 📌 注意事项

- 所有管理员操作必须携带 JWT，token 中需含 `role = ADMIN`
- 所有下单操作允许匿名，但如登录状态存在，则会绑定 userId