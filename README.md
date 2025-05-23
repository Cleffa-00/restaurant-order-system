# 🍽 Restaurant Ordering System

A mobile-first restaurant ordering platform built with Next.js, TypeScript, and Stripe. Customers can scan a QR code to browse the menu, add items to a cart, and pay online. Admins can manage menu items and orders through a secure interface.

## 🌟 Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Prisma ORM** + **Neon (PostgreSQL)**
- **Stripe** for secure payments
- **JWT authentication**
- **Vercel** (Frontend hosting)

## 📱 Mobile-First Design

This system is optimized for mobile users:
- Responsive UI for phones and tablets
- Large, tappable buttons for easy ordering
- Sticky bottom cart and checkout actions
- Optimized performance and image delivery

## 📁 Key Routes

- `/menu` – Browse menu items
- `/cart` – View and manage cart
- `/checkout` – Stripe checkout process
- `/admin/menu` – Admin menu management
- `/admin/orders` – Admin order tracking
- `/auth/login` – Admin login

---

# 🍽 餐馆点餐系统开发计划（Next.js + TypeScript + Stripe）

## ✅ 项目目标
开发一个支持用户浏览菜单、下单、线上支付，以及管理员后台管理菜品与订单的现代点餐系统，技术栈使用 Next.js App Router、TypeScript、Stripe、Prisma。

---

## 📁 项目结构（初步设计）

```
/app
  /menu             -> 菜单页
  /cart             -> 购物车页
  /checkout         -> 支付页
  /auth/login       -> 登录页
  /admin/menu       -> 菜品管理
  /admin/orders     -> 订单管理

/pages/api          -> API 路由（下单、支付、登录等）
/lib                -> 工具函数（如 getUserIdFromRequest.ts）
/components         -> 通用组件（如 Button, MenuItemCard）
/prisma             -> 数据库模型
/middleware.ts      -> 中间件权限控制
```

---

## 📌 功能模块分解

### 👤 用户端功能
- [ ] 菜单展示（支持分类、图片、描述）
- [ ] 加入购物车（本地或 cookie 存储）
- [ ] 创建订单
- [ ] 使用 Stripe 支付（测试模式）
- [ ] 查看支付结果页面

### 🧑‍💼 管理端功能
- [ ] 管理员登录
- [ ] 增删改查菜单项
- [ ] 查看订单列表
- [ ] 修改订单状态（待制作、完成）

### 🔐 权限控制
- [ ] 用户身份 JWT 存储在 Cookie 中
- [ ] 中间件拦截 /admin 路由，仅限管理员访问
- [ ] API 层也需鉴权处理

---

## 🗃 数据库设计（初版）

### User
| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 主键 |
| name | string | 姓名 |
| email | string | 登录用邮箱 |
| passwordHash | string | 密码哈希 |
| isAdmin | boolean | 是否为管理员 |

### MenuItem
| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 主键 |
| name | string | 菜品名 |
| price | number | 价格 |
| description | string | 描述 |
| imageUrl | string | 图片链接 |
| available | boolean | 是否上架 |

### Order
| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 主键 |
| userId | string | 所属用户 |
| totalPrice | number | 总价 |
| status | string | 状态（待支付 / 已支付 / 制作中 / 完成） |
| createdAt | Date | 下单时间 |

### OrderItem
| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 主键 |
| orderId | string | 所属订单 |
| menuItemId | string | 菜品ID |
| quantity | number | 数量 |
| priceAtOrder | number | 下单时价格 |

---

## ⚙️ 技术栈与依赖

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Stripe 支付集成
- Prisma ORM + PostgreSQL（或 SQLite 本地开发）
- JWT 登录鉴权
- Vercel（前端部署）+ Supabase（数据库）

---

## 🧭 项目阶段计划（建议路线）

### 🚀 MVP 阶段（最小可用产品）
- [ ] 菜单浏览页面（/menu）
- [ ] 购物车交互（本地状态）
- [ ] 创建订单（API 接口）
- [ ] Stripe 支付流程
- [ ] 简单 admin 页面增删菜品

### 🔐 第二阶段：权限和管理功能
- [ ] 管理员登录 + middleware 权限控制
- [ ] 订单管理后台
- [ ] 修改订单状态功能

### 📈 第三阶段：扩展优化
- [ ] 用户注册 + 历史订单
- [ ] 移动端适配优化
- [ ] Stripe webhook 支付状态自动更新
- [ ] 支持菜品分类 / 搜索

---

## 🗓 开发进度记录

| 日期 | 内容 |
|------|------|
| 2025-05-22 | 完成需求拆解与计划撰写 |
| 待定 | 项目初始化（create-next-app + Tailwind） |
| 待定 | 创建 Prisma schema 与菜单页 |
| 待定 | Stripe 支付测试接入 |

---

## 📌 备注
- 初期可用 SQLite 快速测试，后续可切换 Supabase PostgreSQL
- Stripe 建议使用 test key 与测试卡完成集成测试

---

## 📚 Documentation Links

- [📄 页面功能详解](./docs/PAGE_BREAKDOWN.md)
- [🔌 API 接口导航总览](./docs/api/API_OVERVIEW.md)
    - [🍽 菜单接口](./docs/api/MENU_ROUTES.md)
    - [🧩 配料选项组接口](./docs/api/OPTION_GROUP_ROUTES.md)
    - [🛒 订单接口](./docs/api/ORDER_ROUTES.md)
    - [💳 Stripe 支付接口](./docs/api/STRIPE_ROUTES.md)
    - [🔐 管理员认证接口](./docs/api/AUTH_ROUTES.md)
    - [📈 营收接口（后期开发）](./docs/api/REVENUE_ROUTES.md)
    - [🧪 请求示例参考](./docs/api/API_REQUEST_EXAMPLES.md)

## 🔧 Environment Setup

1. Clone the repo:
```bash
git clone https://github.com/your-username/restaurant-system.git
cd restaurant-system
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file and include:
```env
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
JWT_SECRET="your_jwt_secret"
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_webhook_secret"
```

4. Migrate and seed the database:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

5. Start the development server:
```bash
pnpm dev
```

## 🧾 Deployment

- Frontend: [Vercel](https://vercel.com/)
- Database: [Neon](https://neon.tech/)
- Stripe: [https://stripe.com](https://stripe.com)

## 📌 License

MIT