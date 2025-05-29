# 🍜 Restaurant Order System - 现代化餐厅订餐系统

<div align="center">
  <img src="public/placeholder-logo.svg" alt="Logo" width="120" height="120">
  
  <h3 align="center">移动优先的现代化餐厅订餐 SaaS 平台</h3>
  
  <p align="center">
    基于 Next.js 15、TypeScript 和 PostgreSQL 构建的全栈订餐系统
    <br />
    <a href="#demo"><strong>查看演示 »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Cleffa-00/restaurant-order-system/issues">报告问题</a>
    ·
    <a href="https://github.com/Cleffa-00/restaurant-order-system/issues">请求功能</a>
  </p>
  
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
</div>

## 📋 目录

- [核心功能](#-核心功能)
- [系统架构](#-系统架构)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [API 文档](#-api-文档)
- [部署指南](#-部署指南)
- [开发指南](#-开发指南)
- [贡献指南](#-贡献指南)

## 🚀 核心功能

### 客户端功能
- **📱 移动优先设计**：完美适配各种设备，流畅的触控体验
- **🛒 智能购物车**：实时价格计算、滑动删除、"飞入购物车"动画
- **🍕 动态菜单系统**：分类树形结构、必选/可选项组、可复用模板
- **💳 安全支付流程**：集成 Stripe 支付、自动计算税费和服务费
- **📍 实时订单追踪**：PENDING → PREPARING → READY → COMPLETED
- **🔐 JWT 身份认证**：手机号 + 短信验证码登录

### 管理后台功能
- **👨‍💼 角色权限管理**：基于角色的访问控制（RBAC）
- **📊 数据可视化**：收入统计、订单分析、销售趋势
- **🍽️ 菜单管理**：CRUD 操作、分类管理、选项组配置
- **📋 订单管理**：实时订单看板、状态更新、批量操作
- **💰 收入管理**：日/周/月收入统计、导出报表

### 技术特性
- **🔷 端到端类型安全**：Prisma 类型贯穿 REST hooks 和 Zod schemas
- **⚡ 服务端渲染**：Next.js 15 App Router + Server Actions
- **🎨 现代化 UI**：Tailwind CSS + Radix UI + Framer Motion
- **📦 优化的状态管理**：React Context + useReducer，无需外部库
- **🔄 实时更新**：WebSocket 支持厨房状态实时同步

## 🏗️ 系统架构

```mermaid
graph TB
    subgraph "前端层"
        A[Next.js App Router] --> B[React Components]
        B --> C[Tailwind CSS + Radix UI]
    end
    
    subgraph "状态管理"
        D[React Context] --> E[购物车状态]
        D --> F[用户认证状态]
    end
    
    subgraph "API 层"
        G[REST API Routes] --> H[JWT 认证中间件]
        H --> I[业务逻辑层]
    end
    
    subgraph "数据层"
        I --> J[Prisma ORM]
        J --> K[PostgreSQL \(Neon\)]
    end
    
    subgraph "外部服务"
        L[Stripe 支付]
        M[SMS 服务]
    end
    
    B --> D
    B --> G
    I --> L
    I --> M

```

## 🛠️ 技术栈

| 层级 | 技术选择 | 说明 |
|------|----------|------|
| **前端框架** | Next.js 15 (App Router) · React 18 | 文件系统路由 + Server Actions |
| **样式/UI** | Tailwind CSS · Radix UI · Framer Motion | 可组合原语 + 动画效果 |
| **状态管理** | React Context + useReducer | 轻量级，无需外部依赖 |
| **表单验证** | React Hook Form · Zod | 端到端类型安全 |
| **身份认证** | JWT (jose) + 路由中间件 | hooks/useAuth, useAdminAuth |
| **数据库** | PostgreSQL @ Neon · Prisma ORM | 声明式 schema + 迁移管理 |
| **支付集成** | Stripe SDK | 隔离在 app/api/stripe/ |
| **开发工具** | TypeScript · ESLint · Prettier | 类型安全 + 代码规范 |

## 🚀 快速开始

### 环境要求

- Node.js 18.17+
- pnpm 8.0+
- PostgreSQL 数据库

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/Cleffa-00/restaurant-order-system.git
cd restaurant-order-system
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
# 数据库连接
DATABASE_URL="postgresql://..."

# JWT 密钥
JWT_SECRET="your-secret-key"

# Stripe（可选）
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# SMS 服务（可选）
SMS_API_KEY="..."
```

4. **初始化数据库**
```bash
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed  # 可选：填充示例数据
```

5. **启动开发服务器**
```bash
pnpm dev
```

访问 http://localhost:3000

### 默认账户

- **管理员**：18888888888 / 123456
- **普通用户**：13888888888 / 123456

## 📁 项目结构

```
restaurant-order-system/
├── app/                      # Next.js App Router
│   ├── (public)/            # 公开页面路由组
│   │   ├── menu/           # 菜单浏览
│   │   ├── cart/           # 购物车
│   │   └── checkout/       # 结账流程
│   ├── (auth)/             # 认证页面路由组
│   │   ├── login/          # 登录
│   │   └── register/       # 注册
│   ├── (customer)/         # 客户页面路由组
│   │   └── orders/         # 订单管理
│   ├── admin/              # 管理后台
│   └── api/                # API 路由
│       └── v1/             # 版本化 API
├── components/             # React 组件
│   ├── menu/              # 菜单相关组件
│   ├── cart/              # 购物车组件
│   ├── admin/             # 管理端组件
│   └── ui/                # 通用 UI 组件
├── lib/                    # 工具库
│   ├── api/               # API 客户端
│   │   ├── client/        # 客户端 API 调用
│   │   ├── services/      # 业务逻辑服务
│   │   └── utils/         # API 工具函数
│   ├── config/            # 配置文件
│   ├── data/              # 模拟数据
│   └── utils/             # 通用工具函数
├── contexts/              # React Context
├── hooks/                 # 自定义 Hooks
├── types/                 # TypeScript 类型定义
├── prisma/                # 数据库 Schema
└── docs/                  # 项目文档
```

## 📚 API 文档

### 认证相关

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/v1/auth/send-sms` | POST | 发送验证码 |
| `/api/v1/auth/verify-sms` | POST | 验证短信码 |
| `/api/v1/auth/login` | POST | 用户登录 |
| `/api/v1/auth/register` | POST | 用户注册 |
| `/api/v1/auth/refresh` | POST | 刷新 Token |

### 菜单管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/v1/menu` | GET | 获取完整菜单 |
| `/api/v1/menu-items` | GET | 获取菜品列表 |
| `/api/v1/menu-items/:id` | GET/PUT/DELETE | 菜品 CRUD |

### 订单管理

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/v1/orders` | POST | 创建订单 |
| `/api/v1/orders/:id` | GET | 获取订单详情 |
| `/api/v1/orders/:id/status` | PUT | 更新订单状态 |

完整 API 文档请查看 `/docs/api/`

## 🚢 部署指南

### Vercel 部署（推荐）

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

### Docker 部署

```bash
docker build -t restaurant-order-system .
docker run -p 3000:3000 restaurant-order-system
```

### 传统部署

```bash
pnpm build
pnpm start
```

## 💻 开发指南

### 命令脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 ESLint |
| `pnpm format` | 运行 Prettier |
| `pnpm test` | 运行测试 |
| `pnpm prisma studio` | 打开 Prisma Studio |

### 开发规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 使用约定式提交（Conventional Commits）
- 保持组件单一职责
- 编写单元测试和集成测试

### 性能优化

- 使用 Next.js Image 组件优化图片
- 实施路由预加载
- 使用 React.memo 和 useMemo 优化渲染
- 启用 Prisma 查询优化

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 提交规范

使用约定式提交：
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Radix UI](https://www.radix-ui.com/) - UI 组件库
- [Prisma](https://www.prisma.io/) - ORM
- [Vercel](https://vercel.com/) - 部署平台
