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

# 🍽 餐馆点餐系统开发计划

## ✅ 项目目标
开发一个支持用户浏览菜单、下单、线上支付，以及管理员后台管理菜品与订单的现代点餐系统。

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
- 菜单展示（支持分类、图片、描述、弹窗配料选择）
- 加入购物车（本地或 cookie 存储）
- 创建订单（含手机号、备注）
- Stripe 支付（测试模式）
- 查看支付结果页面

### 🧑‍💼 管理端功能
- 管理员登录（JWT）
- 增删改查菜单项
- 订单列表 / 状态更新
- 后期：查看营收统计数据

### 🔐 权限控制
- 管理员登录后获得 JWT，存储在 cookie
- 后台页面与 API 需中间件校验是否为管理员
- 前端需在请求 header 添加 Bearer Token

---

## 🗃 数据库设计（修正版）

### AdminUser
| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 主键 |
| email | string | 登录邮箱 |
| password | string | 密码哈希 |
| createdAt | Date | 创建时间 |

### MenuItem
| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 主键 |
| name | string | 菜名 |
| price | decimal | 价格 |
| description | string | 描述 |
| imageUrl | string | 图片链接 |
| available | boolean | 是否上架 |
| category | string | 类别 |
| optionGroups | 关联 | 配料选项组 |
| orderItems | 关联 | 关联订单项 |

### MenuOptionGroup & MenuOption
- OptionGroup：包含名称、是否为必选
- Option：包含配料名称、附加价

### Order
| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 主键 |
| phone | string | 顾客手机号 |
| name | string | 顾客姓名 |
| status | enum | PENDING / IN_PROGRESS / COMPLETED / CANCELLED |
| paymentStatus | enum | UNPAID / PAID |
| totalPrice | decimal | 总价 |
| createdAt | Date | 下单时间 |

### OrderItem
| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 主键 |
| orderId | string | 所属订单 |
| menuItemId | string | 菜品ID |
| quantity | int | 数量 |
| unitPrice | decimal | 单价快照 |
| note | string | 备注 |
| options | 关联 | 用户选择的配料 |

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

---

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

---

## 🧾 Deployment

- Frontend: [Vercel](https://vercel.com/)
- Database: [Neon](https://neon.tech/)
- Stripe: [https://stripe.com](https://stripe.com)

## 📌 License

MIT


## 🗂 数据库结构图（ER 图说明）

本项目使用 Prisma + PostgreSQL 搭配 Neon 构建数据库，以下是系统核心模型及其关系简述，以及自动生成的 ER 图（实体关系图）。

---

### 🧩 核心模型说明

#### 👨‍🍳 MenuItem（菜品）
- 基础信息（名称、价格、描述、图片）
- 与多个 MenuOptionGroup（选项组）关联
- 被多个订单项（OrderItem）引用

#### 🧂 MenuOptionGroup（选项组）
- 属于某个 MenuItem
- 标记为必选 / 可选
- 包含多个 MenuOption（具体配料项）

#### 🍱 MenuOption（选项项）
- 属于某个选项组
- 可附加价格增量（如加蛋 +$1）

#### 🧾 Order（订单）
- 包含手机号、姓名、支付状态、订单状态
- 与多个 OrderItem（订单中的菜）关联

#### 🍽 OrderItem（订单项）
- 记录点的某道菜及其数量、备注
- 包含多个 OrderItemOption（具体配料选择）

#### 🧂 OrderItemOption（订单项配料）
- 记录顾客为某道菜选择的配料内容

#### 🔑 AdminUser（管理员）
- 用于后台管理登录

---

### 🖼 ER 图预览

![实体关系图](./ERD.png)

此图展示了所有模型之间的关系，包括一对多、多对一等外键结构，适合快速理解系统数据流。