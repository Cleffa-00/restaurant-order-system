## 🗂 前端目录结构说明（Next.js App Router + i18n）

以下是项目基于 App Router 的推荐结构，包含多语言支持、菜单展示、购物车、结账与后台管理等页面。

\`\`\`
/app
  /layout.tsx               全局布局组件
  /globals.css              Tailwind 全局样式
  /page.tsx                 默认重定向到 /[locale]/menu

  /[locale]                 多语言路由（zh/en）
    /layout.tsx             语言环境布局（NextIntlClientProvider）
    
    /menu
      /page.tsx             菜单页（分类 + 菜品列表）
      /[menuItemId]/modal.tsx 配料弹窗（可选）

    /cart
      /page.tsx             购物车页（本地存储 + 订单提交）

    /checkout
      /page.tsx             填手机号和姓名进入 Stripe 支付页

    /success
      /page.tsx             结账完成后的提示页

    /auth/login/page.tsx    管理员登录页

    /admin
      /layout.tsx           后台布局（带侧边栏）
      /menu/page.tsx        菜品管理页（增删改查）
      /orders/page.tsx      订单管理页
      /revenue/page.tsx     营收统计（后期开发）

/components
  /ui/                      通用 UI（shadcn 封装）
  /menu/                    菜单页组件（MenuCard 等）
  /cart/                    购物车组件（CartItem、StickyBar）
  /admin/                   管理后台组件（表格、卡片）
  /LanguageSwitcher.tsx     语言切换组件

/lib
  stripe.ts                 Stripe 封装
  auth.ts                   JWT 解码与鉴权
  prisma.ts                 Prisma 实例导出
  utils.ts                  常用工具函数

/hooks
  useCart.ts                购物车状态管理
  useAdminAuth.ts           管理员权限 Hook

/constants
  enum.ts                   枚举值（订单状态、支付状态）

/types
  index.ts                  TypeScript 类型定义

/public
  /locales                  语言资源文件
    /zh/common.json         中文翻译
    /en/common.json         英文翻译
  logo.svg, empty.svg 等静态资源

/middleware.ts              JWT 权限 + i18n 路由中间件

.env.local                  环境变量配置
\`\`\`

---
