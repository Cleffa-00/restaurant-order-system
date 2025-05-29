# 🍜 Restaurant-Order-System

> **Modern mobile-first food ordering SaaS built with Next 15, TypeScript & PostgreSQL**
> Browse menu ➜ build cart ➜ pay ➜ track order ➜ manage in admin.

![Node](https://img.shields.io/badge/node-18%2B-green)
![Next.js](https://img.shields.io/badge/next-15-black)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Key Features

* **Menu & options:** category tree, option-groups (required/optional), reusable templates.
* **Smart cart:** live price calc, mobile swipe-to-delete, “flying-to-cart” animation.
* **Checkout flow:** phone + name, tax & service-fee auto-calc, Stripe payment example.
* **Realtime kitchen status:** PENDING → PREPARING → READY → COMPLETED.
* **Role-based admin:** menu CRUD, order board, revenue API.
* **Typed from DB to UI:** Prisma types propagate through REST hooks & Zod schemas.

---

## 🛠️ Tech Stack

| Layer                  | Choice                                  | Notes                                |
| ---------------------- | --------------------------------------- | ------------------------------------ |
| **Frontend**           | Next.js 15 (App Router) · React 18      | file-system routing + Server Actions |
| **Styling/UI**         | Tailwind CSS · Radix UI · Framer Motion | composable primitives & animation    |
| **State**              | React Context + useReducer              | tiny, no external store needed       |
| **Forms & Validation** | React Hook Form · Zod                   | end-to-end type safety               |
| **Auth**               | JWT (jose) + route middleware           | hooks/**useAuth**, **useAdminAuth**  |
| **Database**           | PostgreSQL @ Neon · Prisma ORM          | declarative schema & migrations      |
| **Payments**           | Stripe SDK (optional)                   | isolated in `app/api/stripe/`        |

---

## 📁 Project Structure (level ≤ 3)

> **A. Feature folders** – “what the app does”
> **B. Infrastructure folders** – “how the app works”

```text
restaurant-order-system/
│
├─ app/                       # A ▸ pages & API (App Router)
│   ├─ (site)/
│   │   ├─ menu/              #   public menu
│   │   ├─ cart/
│   │   ├─ checkout/
│   │   ├─ login/ register/
│   │   └─ order-confirmation/
│   ├─ admin/                 #   admin dashboard (RBAC via middleware)
│   └─ api/                   #   route handlers (REST-ish)
│       ├─ menu-items/
│       ├─ option-groups/
│       ├─ orders/
│       ├─ auth/
│       └─ stripe/
│
├─ components/                # A ▸ UI widgets (feature-first)
│   ├─ menu/
│   ├─ cart/
│   ├─ checkout/
│   ├─ admin/
│   └─ ui/                    #   Design-system atoms (Button, Modal…)
│
├─ contexts/                  # B ▸ React global stores
│   └─ cart-context.tsx
│
├─ hooks/                     # B ▸ reusable logic
│   ├─ useAuth.tsx
│   ├─ useAdminAuth.tsx
│   ├─ useCheckoutForm.ts
│   └─ ...
│
├─ lib/                       # B ▸ “service layer”
│   ├─ api/                   #   thin client for `/app/api/*`
│   └─ utils/                 #   pure helpers (dates, money, cart math)
│
├─ prisma/                    # B ▸ DB schema & migrations
│   ├─ schema.prisma
│   └─ migrations/
│
├─ types/                     # B ▸ shared TypeScript types & enums
├─ styles/                    # B ▸ global CSS (if any) & Tailwind config
├─ docs/                      # B ▸ living spec & API reference
│   └─ api/
│       ├─ MENU_ROUTES.md
│       └─ ...
└─ public/                    # static assets (images, icons, fonts)
```

<details>
<summary><strong>Why this split?</strong></summary>

* **Feature folders** keep UI + route + tests for one domain together → easy deletion or lazy-loading.
* **Infrastructure folders** centralise cross-cutting concerns (data, hooks, utils) → avoid deep relative paths.

</details>

---

## 🧩 Data Model (Prisma)

```prisma
model User        { id Int @id @default(autoincrement()) role Role phone String … }
model Category    { id Int @id name  String … parentId Int? }
model MenuItem    { id Int @id name  String price Decimal deleted Boolean @default(false) … }
model OptionGroup { id Int @id name  String required Boolean … }
model Option      { id Int @id label String priceDiff Decimal … }
model Order       { id Int @id status OrderStatus payment PaymentStatus … }
enum Role         { USER ADMIN }
enum OrderStatus  { PENDING PREPARING READY COMPLETED CANCELLED }
enum PaymentStatus{ UNPAID PAID }
```

*(full schema in `/prisma/schema.prisma`)*

---

## ⚡ Quick Start

```bash
pnpm i                 # install deps
cp .env.example .env   # fill DB_URL & JWT_SECRET
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev               # http://localhost:3000
```

---

## 📚 Scripts

| Script        | What it does                    |
| ------------- | ------------------------------- |
| `pnpm dev`    | dev server with hot-reload      |
| `pnpm build`  | compile & bundle for production |
| `pnpm start`  | start prod server (`.next/`)    |
| `pnpm lint`   | eslint + prettier               |
| `pnpm format` | run prettier                    |
| `pnpm test`   | vitest (if configured)          |

---

## 🗺️ Optimization Tips

1. **Adopt feature-based co-location** (already started): migrate any stray logic from `lib/` into respective feature folders, leaving only truly shared helpers.
2. **Bounded contexts for admin vs client UI**: consider a separate `admin/` root inside `components/` and `app/(admin)` route group → reduces mixed imports.
3. **Automate imports**: enable `@/` alias (`tsconfig.paths`) so moving files won’t break deep relatives.
4. **Keep a living architecture doc** in `/docs/architecture.md` with diagrams as you refactor.

---

## 🤝 Contributing

1. **Fork** → **feature branch** (`feat/xyz`)
2. `pnpm cz` (commitizen) for conventional commits
3. **PR** against `main`; CI must pass
4. One feature / bugfix per PR please 🙂

---

## 📝 License

[MIT](./LICENSE)

---

> *Happy hacking & bon appétit!* 🍽️