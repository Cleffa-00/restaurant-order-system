# 🔌 API 接口导航总览（基于 App Router）

本项目使用 Next.js 14 App Router 实现所有 RESTful API 路由，以下为各模块对应的路径结构：

---

## 📦 核心接口模块

### 🍽 菜单接口 `/api/menu`
- `GET /api/menu` - 获取所有菜单项
- `GET /api/menu/:id` - 获取指定菜单项详情
- `PATCH /api/menu/:id` - 更新菜单项（管理员）
- `DELETE /api/menu/:id` - 删除菜单项（管理员）

### 🧩 配料选项接口 `/api/options`
- `GET /api/options/groups/:menuItemId` - 获取某个菜的所有选项组
- `POST /api/options/groups/:menuItemId` - 新建选项组
- `PATCH /api/options/groups/:groupId` - 更新选项组
- `DELETE /api/options/groups/:groupId` - 删除选项组
- `GET /api/options/templates` - 获取所有选项模板
- `POST /api/options/templates` - 新建模板
- `PATCH /api/options/templates/:templateId` - 修改模板
- `DELETE /api/options/templates/:templateId` - 删除模板

### 🛒 订单接口 `/api/orders`
- `GET /api/orders` - 获取所有订单（管理员）
- `POST /api/orders` - 提交新订单
- `GET /api/orders/:id` - 获取订单详情
- `PATCH /api/orders/:id` - 更新订单状态（管理员）

### ���������� 支付接口 `/api/payment`
- `POST /api/payment/checkout` - 创建 Stripe Checkout 会话
- `POST /api/payment/webhook` - Stripe 支付 Webhook 回调（服务器端）

### 🔐 登录认证接口 `/api/auth`
- `POST /api/auth/login` - 管理员登录
- `GET /api/auth/me` - 获取当前登录用户（用于客户端判断角色）

---

## 📈 后期拓展模块

### 📈 营收接口 `/api/admin/revenue`（后期开发）
- `GET /api/admin/revenue/summary` - 获取营收概览数据
- `GET /api/admin/revenue/chart` - 获取时间趋势图数据

---

## 🧪 注意事项

- 所有需要登录验证的接口均使用 JWT，保存在 Cookie 中，使用 `Authorization: Bearer` 格式访问
- 管理员权限判断依赖 `user.role === 'ADMIN'`
- 所有路由遵循 RESTful 设计风格，状态码统一规范
