# 🍽 餐馆点餐系统

这是一个面向移动端优化的餐馆点餐平台，使用 Next.js、TypeScript 和 Stripe 构建。顾客可以通过扫码访问菜单、添加商品至购物车并完成线上支付，管理员可登录后台管理菜单和订单。

---

## 🌟 技术栈

- **Next.js**（App Router）+ **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Prisma ORM** + **Neon（PostgreSQL）**
- **Stripe** 支付集成
- **JWT 身份认证**
- **Vercel** 部署前端

---

## 📱 移动端优先设计

- 自适应手机和平板
- 按钮大且易点击
- 底部浮动购物车与结账操作栏
- 图片加载优化、响应迅速

---

## 📁 系统主要页面路由

- `/menu`：菜单浏览页面
- `/cart`：购物车页面
- `/checkout`：Stripe 结账流程
- `/admin/menu`：后台菜单管理
- `/admin/orders`：后台订单管理
- `/auth/login`：管理员登录页

---

## ✅ 项目功能模块

### 👤 用户端
- 菜品浏览与分类筛选
- 配料弹窗选择（必选/可选/备注）
- 添加购物车、本地缓存
- 填写手机号 + 姓名后下单
- Stripe 支付跳转
- 成功页面提示（禁止修改撤销）

### 🧑‍💼 管理端
- 登录后进入后台
- 管理菜单（增删改查、上下架、配料组设置）
- 管理订单状态（新订单、高亮、标记完成）
- 后期支持查看营收统计图表

### 🔐 权限与认证
- 管理员登录后获得 JWT 存入 Cookie
- 所有 `/admin/*` 页面与 API 使用中间件权限校验
- 所有后台写操作 API 均需在请求头添加 Bearer Token

---

## 🗃 数据库结构（基于 Prisma + Neon）

本数据库使用 Prisma 构建，支持分类管理、模板化菜单选项、顾客关联订单、管理员分级权限等功能模块。

---

### 👤 AdminUser（管理员账户）

| 字段名   | 类型       | 说明              |
|----------|------------|-------------------|
| id       | String     | 主键 UUID         |
| email    | String     | 登录邮箱，唯一    |
| password | String     | 加密后密码        |
| role     | AdminRole  | 管理员角色        |
| createdAt| DateTime   | 创建时间          |

---

### 🧾 Customer（顾客用户）

| 字段名   | 类型     | 说明               |
|----------|----------|--------------------|
| id       | String   | 主键 UUID          |
| phone    | String   | 手机号，唯一        |
| name     | String?  | 昵称（可选）        |
| email    | String?  | 邮箱（可选）        |
| createdAt| DateTime | 注册时间           |
| orders   | Order[]  | 顾客下的所有订单    |

---

### 🗂 Category（菜单分类）

| 字段名   | 类型     | 说明                       |
|----------|----------|----------------------------|
| id       | String   | 主键 UUID                  |
| name     | String   | 分类中文名（如“主食”）     |
| slug     | String   | 唯一标识符（如“main”）     |
| order    | Int      | 显示排序（从小到大）       |
| visible  | Boolean  | 是否展示在前端导航中       |
| menuItems| MenuItem[] | 属于此分类的菜单项       |

---

### 🍽 MenuItem（菜单项）

| 字段名       | 类型              | 说明                      |
|--------------|-------------------|---------------------------|
| id           | String            | 主键 UUID                 |
| name         | String            | 菜名                      |
| description  | String?           | 菜品描述（可选）          |
| price        | Decimal           | 基础价格                  |
| imageUrl     | String?           | 菜品图片链接（可选）      |
| available    | Boolean           | 是否当前可下单            |
| deleted      | Boolean           | 是否软删除                |
| categoryId   | String?           | 所属分类 ID               |
| category     | Category?         | 所属分类对象（可选）      |
| optionGroups | MenuOptionGroup[] | 该菜单项的选项组副本集合  |
| orderItems   | OrderItem[]       | 被哪些订单项引用          |
| createdAt    | DateTime          | 创建时间                  |
| updatedAt    | DateTime          | 更新时间                  |

---

### 🧩 OptionGroupTemplate / OptionTemplate（全局配料模板）

#### OptionGroupTemplate

| 字段名   | 类型         | 说明            |
|----------|--------------|-----------------|
| id       | String       | 主键 UUID       |
| name     | String       | 分组名（如“辣度”） |
| required | Boolean      | 是否为必选       |
| options  | OptionTemplate[] | 模板选项列表 |

#### OptionTemplate

| 字段名    | 类型     | 说明           |
|-----------|----------|----------------|
| id        | String   | 主键 UUID      |
| name      | String   | 选项名         |
| priceDelta| Decimal  | 加价金额       |
| groupId   | String   | 所属模板组 ID  |

---

### 🧂 MenuOptionGroup / MenuOption（菜品专用选项）

#### MenuOptionGroup

| 字段名     | 类型               | 说明                     |
|------------|--------------------|--------------------------|
| id         | String             | 主键 UUID                |
| name       | String             | 分组名称                 |
| required   | Boolean            | 是否为必选项组           |
| menuItemId | String             | 所属菜品 ID              |
| templateId | String?            | 来源模板 ID（可选）      |
| deleted    | Boolean            | 是否软删除               |
| options    | MenuOption[]       | 实际展示的选项列表       |

#### MenuOption

| 字段名    | 类型     | 说明           |
|-----------|----------|----------------|
| id        | String   | 主键 UUID      |
| name      | String   | 配料名称       |
| priceDelta| Decimal  | 加价金额       |
| groupId   | String   | 所属选项组 ID  |
| deleted   | Boolean  | 是否软删除     |

---

### 📦 Order（订单）

| 字段名        | 类型         | 说明                      |
|----------------|--------------|---------------------------|
| id             | String       | 主键 UUID                 |
| phone          | String       | 顾客手机号                |
| name           | String       | 顾客姓名                  |
| status         | OrderStatus  | 订单状态（如 PENDING）     |
| paymentStatus  | PaymentStatus| 支付状态（如 UNPAID）      |
| orderSource    | String?      | 下单来源标记（如扫码）     |
| customerNote   | String?      | 整单备注（如“加快制作”）   |
| customerId     | String?      | 所属顾客 ID（可选）        |
| customer       | Customer?    | 关联顾客（可选）           |
| items          | OrderItem[]  | 包含的订单项数组           |
| createdAt      | DateTime     | 下单时间                   |

---

### 🍱 OrderItem（订单中某道菜）

| 字段名           | 类型     | 说明                      |
|------------------|----------|---------------------------|
| id               | String   | 主键 UUID                 |
| menuItemId       | String   | 所选菜品 ID               |
| menuItemName     | String   | 菜名快照                  |
| menuItemImage    | String?  | 图片链接快照              |
| menuItemCategory | String?  | 分类快照                  |
| quantity         | Int      | 数量                      |
| note             | String?  | 顾客备注（如“少辣”）      |
| unitPrice        | Decimal  | 单价快照                  |
| options          | OrderItemOption[] | 配料快照项数组  |

---

### 🧪 OrderItemOption（订单中某个选项）

| 字段名    | 类型     | 说明                         |
|-----------|----------|------------------------------|
| id        | String   | 主键 UUID                    |
| optionName| String   | 配料名称快照（如“加蛋”）     |
| groupName | String?  | 所属组名快照（如“附加”）     |
| priceDelta| Decimal  | 当时加价金额                 |

---

### 📘 枚举类型

#### AdminRole

- ADMIN
- MANAGER
- STAFF
- READONLY

#### OrderStatus

- PENDING
- IN_PROGRESS
- COMPLETED
- CANCELLED

#### PaymentStatus

- UNPAID
- PAID

---

## 🖼 实体关系图（ER 图）

![ER 图 老版本](./docs/ERD.png)

此图展示各模型之间的关系结构，一对多、多对一字段、外键连接等。

---

## 📚 文档资料导航

- [📄 页面功能详解](./docs/PAGE_BREAKDOWN.md)
- [🔌 API 总览](./docs/api/API_OVERVIEW.md)
  - [🍽 菜单接口](./docs/api/MENU_ROUTES.md)
  - [🧩 配料接口](./docs/api/OPTION_GROUP_ROUTES.md)
  - [🛒 订单接口](./docs/api/ORDER_ROUTES.md)
  - [💳 支付接口](./docs/api/STRIPE_ROUTES.md)
  - [🔐 登录接口](./docs/api/AUTH_ROUTES.md)
  - [📈 营收接口](./docs/api/REVENUE_ROUTES.md)
  - [🧪 请求示例](./docs/api/API_REQUEST_EXAMPLES.md)

---

## 🧰 本地开发环境配置

1. 克隆项目：
```bash
git clone https://github.com/your-username/restaurant-system.git
cd restaurant-system
```

2. 安装依赖：
```bash
pnpm install
```

3. 创建 `.env` 环境变量文件：
```env
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
JWT_SECRET="your_jwt_secret"
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_webhook_secret"
```

4. 数据库初始化：
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

5. 启动开发服务器：
```bash
pnpm dev
```

---

## 🚀 部署建议

- 前端部署平台：Vercel
- 数据库托管平台：Neon
- 支付平台：Stripe（可使用测试卡测试）

---

## 📄 许可协议

本项目采用 MIT 开源协议，详情见 LICENSE 文件。