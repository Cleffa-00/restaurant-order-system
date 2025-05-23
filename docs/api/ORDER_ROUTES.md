# 🛒 订单接口文档（ORDER_ROUTES.md）

订单接口提供用户下单与支付前的信息提交，管理员可查看订单并更新状态。

---

## `POST /api/orders`

### ✅ 功能说明：
创建新订单，包含用户信息、菜品项、选项选择、备注等。

### ✅ 请求体：
```json
{
  "name": "王小明",
  "phone": "1234567890",
  "orderSource": "mobile-web",
  "customerNote": "尽快送上",
  "items": [
    {
      "menuItemId": "menu_1",
      "quantity": 2,
      "note": "不要葱",
      "options": [
        { "optionName": "不辣", "groupName": "辣度", "priceDelta": 0 }
      ]
    },
    {
      "menuItemId": "menu_2",
      "quantity": 1,
      "options": [
        { "optionName": "加蛋", "groupName": "加料", "priceDelta": 1 }
      ]
    }
  ]
}
```

### ✅ 成功响应：
```json
{
  "orderId": "order_123",
  "message": "Order created"
}
```

### ❌ 失败响应示例：
```json
{ "error": "Invalid phone number" }
```

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                       |
|--------|--------------|----------------------------|
| 201    | Created      | 创建成功                   |
| 400    | Bad Request  | 参数无效、字段缺失         |
| 500    | Server Error | 系统异常                   |

---

## `GET /api/orders/:id` 🔐（管理员专用）

### ✅ 功能说明：
获取订单详情（包括下单人、状态、菜品及配料快照）。

### ✅ 响应示例：
```json
{
  "id": "order_123",
  "name": "王小明",
  "phone": "1234567890",
  "status": "PENDING",
  "paymentStatus": "UNPAID",
  "totalPrice": 43.5,
  "items": [
    {
      "menuItemName": "番茄炒蛋",
      "quantity": 2,
      "unitPrice": 12.5,
      "options": [
        { "groupName": "辣度", "optionName": "不辣", "priceDelta": 0 }
      ]
    }
  ]
}
```

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                       |
|--------|--------------|----------------------------|
| 200    | OK           | 获取成功                   |
| 401    | Unauthorized | 缺少管理员权限             |
| 404    | Not Found    | 订单不存在                 |
| 500    | Server Error | 系统异常                   |

---

## `PATCH /api/orders/:id/status` 🔐（管理员专用）

### ✅ 功能说明：
更新订单状态（如接单、制作中、完成、取消）

### ✅ 请求体：
```json
{
  "status": "IN_PROGRESS"
}
```

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                       |
|--------|--------------|----------------------------|
| 200    | OK           | 状态更新成功               |
| 400    | Bad Request  | 状态值非法                 |
| 401    | Unauthorized | 缺少权限                   |
| 404    | Not Found    | 订单不存在                 |
| 500    | Server Error | 系统异常                   |

---

## 📌 注意事项

- 创建订单时会保存快照（菜名、单价、配料名），即使菜单后续修改也不影响订单
- 支付状态的变更建议通过 Stripe Webhook 实现（见 Stripe 接口）
- 状态字段推荐值见枚举：`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`