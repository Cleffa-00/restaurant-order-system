# 🔐 用户认证接口文档（AUTH_ROUTES.md）

本模块用于处理用户（包含管理员）的登录流程，颁发 JWT Token 并在中间件中校验权限。

---

## `POST /api/auth/login`

### ✅ 功能说明：
用户登录接口，验证邮箱和密码是否匹配，登录成功后返回带有权限角色的 JWT。

### ✅ 请求体：
\`\`\`json
{
  "email": "admin@example.com",
  "password": "your_password"
}
\`\`\`

### ✅ 成功响应：
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_abc",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
\`\`\`

### ❌ 失败响应示例：
\`\`\`json
{ "error": "Invalid email or password" }
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                            |
|--------|--------------|---------------------------------|
| 200    | OK           | 登录成功，返回 JWT               |
| 400    | Bad Request  | 缺少字段                        |
| 401    | Unauthorized | 邮箱或密码错误                   |
| 500    | Server Error | 系统错误                        |

---

## 🔐 中间件权限说明

所有受限页面或 API 需校验 JWT 中的用户身份。常见场景：

### ✅ 示例：
- 管理员访问 `/admin/*` 页面或 API 时，需校验：
\`\`\`ts
if (decoded.role !== 'ADMIN') {
  return NextResponse.redirect('/auth/login');
}
\`\`\`

- API 层权限检查（如修改订单）：
\`\`\`ts
if (!decoded || decoded.role !== 'ADMIN') {
  return res.status(401).json({ error: "Unauthorized" });
}
\`\`\`

---

## 📘 JWT 签名说明

- 使用 `jsonwebtoken` 库签发和验证
- 签发时包含字段：`id`, `email`, `role`
- 使用 `.env` 中的 `JWT_SECRET` 进行签名

---

## 📌 其他说明

- 若未来支持顾客注册登录，可使用 `role = CUSTOMER` 区分
- 管理员用户由系统初始化或后台创建，不开放注册入口
