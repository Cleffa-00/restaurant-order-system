# 🛒 订单接口文档（ORDER_ROUTES.md）

该模块用于用户下单、查看订单，以及管理员查看和更新订单状态。

---

## `POST /api/orders`

### ✅ 功能说明：
用户创建订单。无需登录，需提供手机号、姓名、购物车详情、配料、备注等。

### ✅ 请求体示例：
\`\`\`json
{
  "name": "张三",
  "phone": "1234567890",
  "note": "不要葱",
  "items": [
    {
      "menuItemId": "item_001",
      "quantity": 2,
      "note": "微辣",
      "options": [
        { "groupName": "辣度", "optionName": "微辣", "priceDelta": 0.5 },
        { "groupName": "加料", "optionName": "加蛋", "priceDelta": 1.0 }
      ]
    }
  ]
}
\`\`\`

### ✅ 成功响应：
\`\`\`json
{
  "orderId": "order_abc123",
  "status": "PENDING"
}
\`\`\`

---

## `GET /api/orders/:id`

### ✅ 功能说明：
用户或后台查询某笔订单信息。

### ✅ 成功响应：
\`\`\`json
{
  "id": "order_abc123",
  "name": "张三",
  "phone": "1234567890",
  "status": "PENDING",
  "paymentStatus": "UNPAID",
  "user": {
    "id": "user_001",
    "name": "张三",
    "role": "CUSTOMER"
  },
  "items": [
    {
      "menuItemName": "鱼香肉丝",
      "quantity": 2,
      "unitPrice": 15.0,
      "note": "微辣",
      "options": [
        { "optionName": "微辣", "groupName": "辣度", "priceDelta": 0.5 }
      ]
    }
  ]
}
\`\`\`

---

## `PATCH /api/orders/:id/status`

### ✅ 功能说明：
管理员更新订单状态和支付状态。

### ✅ 请求体示例：
\`\`\`json
{
  "status": "COMPLETED",
  "paymentStatus": "PAID"
}
\`\`\`

### 🔁 响应状态码：
| 状态码 | 含义         | 说明                |
|--------|--------------|---------------------|
| 200    | OK           | 成功更新            |
| 401    | Unauthorized | 未附带管理员权限     |
| 404    | Not Found    | 订单不存在          |
| 500    | Server Error | 内部错误            |

---

## 📌 注意事项

- 下单不要求登录，但后台可通过 `userId` 追溯订单归属
- 所有后台更新订单接口需管理员登录（JWT 验证 role）
- 下单后禁止用户修改订单内容（除非由后台处理）
