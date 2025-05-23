# 🔐 管理员认证接口文档（AUTH_ROUTES.md）

该模块用于管理员身份登录、获取 JWT，以及中间件验证鉴权访问受限 API。

---

## `POST /api/auth/login`

### ✅ 功能说明：
管理员登录，验证邮箱与密码，返回 JWT 用于后续请求鉴权。

### ✅ 请求体：
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

### ✅ 成功响应：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "user_abc",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### ❌ 失败响应示例：
```json
{ "error": "Invalid email or password" }
```

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                            |
|--------|--------------|---------------------------------|
| 200    | OK           | 登录成功，返回 JWT               |
| 400    | Bad Request  | 缺少字段                        |
| 401    | Unauthorized | 邮箱或密码错误                   |
| 500    | Server Error | 系统错误                        |

---

## 中间件鉴权说明

后台页面（如 `/admin/menu`）或敏感接口需使用 JWT 鉴权。

在 Next.js 中间件中需实现如下逻辑：

### ✅ 行为规则：
- 请求头包含：
  ```http
  Authorization: Bearer your_jwt_here
  ```
- 若无效：
  - 页面请求：重定向至 `/auth/login`
  - API 请求：返回 401 错误，由接口自行处理

---

## JWT 验证说明

- 使用 `jsonwebtoken` 验证，密钥为 `process.env.JWT_SECRET`
- 建议有效期为 7 天，可通过 `exp` 字段控制

---

## 📌 注意事项

- 所有管理员写操作（新增菜单、修改订单状态等）必须使用此 JWT
- 前端可将 token 存储于 cookie 或 memory 中