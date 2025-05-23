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