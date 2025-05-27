# 💳 Stripe 支付接口文档（STRIPE_ROUTES.md）

该模块用于处理用户支付流程，包括调用 Stripe 创建支付会话、监听支付状态 Webhook 并返回支付结果页。

---

## `POST /api/checkout`

### ✅ 功能说明：
为一个已创建的订单发起 Stripe Checkout 支付流程，返回 Stripe 跳转链接。

会向 Checkout Session 中传入 `metadata.orderId` 字段，便于 webhook 确认订单归属。

### ✅ 请求体：
\`\`\`json
{
  "orderId": "order_abc123"
}
\`\`\`

### ✅ 响应示例：
\`\`\`json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_..."
}
\`\`\`

### ❌ 失败响应示例：
\`\`\`json
{ "error": "Invalid order ID or order already paid" }
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                        |
|--------|--------------|-----------------------------|
| 200    | OK           | 成功返回支付跳转链接         |
| 400    | Bad Request  | 参数缺失或订单非法           |
| 500    | Server Error | Stripe 调用失败或系统异常     |

---

## `POST /api/stripe/webhook`

### ✅ 功能说明：
Stripe Webhook 接口用于接收支付完成等状态变更事件，并更新订单支付状态。

该接口将校验 `Stripe-Signature` 请求头签名，防止伪造请求。

> ⚠️ 该接口必须由 Stripe 服务调用，需验证签名。

### 🔁 支持事件：
- `checkout.session.completed`：支付完成
- `payment_intent.succeeded`：支付成功
- 其他事件可记录或忽略

### ✅ 示例行为：
当 Stripe 通知支付成功时，更新订单状态：
\`\`\`ts
order.paymentStatus = "PAID"
\`\`\`

### ❌ 错误响应示例：
\`\`\`json
{ "error": "Invalid Stripe signature" }
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                          |
|--------|--------------|-------------------------------|
| 200    | OK           | Stripe Webhook 接收成功       |
| 400    | Bad Request  | 请求格式错误                  |
| 401    | Unauthorized | 签名验证失败                  |
| 500    | Server Error | Stripe 验证或系统处理异常      |

---

## `GET /checkout/success` & `GET /checkout/cancel`

### ✅ 功能说明：
前端支付完成跳��页，仅展示支付成功 / 取消结果，**不负责实际状态更改**，实际处理由 Webhook 完成。

---

## 📌 接口注意事项

- 所有订单创建后才可发起 Stripe 支付
- Webhook 地址在 Stripe 后台设置，需保持签名密钥一致
- 前端跳转页无需鉴权，仅作为提示展示用途
