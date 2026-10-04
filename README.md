# Karu — Premium Artisan & Small-Business Marketplace

> An investor-grade, India-first marketplace platform built for global scale.
> Apple × Stripe × Framer × Linear × Airbnb × Shopify visual quality, with a
> production-grade commerce engine underneath.

---

## 1. Project Overview

- **Name:** Karu
- **Goal:** A premium marketplace where verified Indian artisans and small
  businesses sell handcrafted goods to a global, discerning audience — with
  payments, logistics, AI tooling, and a cinematic shopping experience built in.
- **Architecture:** Modular monolith on **Next.js 15 App Router** (React 19
  Server Components + Server Actions), Prisma ORM, with safe production-like
  mocks/fallbacks so the app is **fully runnable with zero external services**.

### Highlights
- Full marketplace roles: Guest, Buyer, Seller, Business Seller, Support,
  Moderator, Admin, Super Admin (hierarchical RBAC).
- Commerce: cart → checkout → Razorpay payment (with mock mode) → order →
  fulfillment → refunds, all idempotent and inventory-safe.
- Seller Studio & Admin dashboards (moderation, sellers, users, orders).
- AI features: listing copy, auto-tagging, review summaries, translation, and a
  public support assistant — all with deterministic local fallbacks.
- Premium experience layer: GSAP/Framer motion, Lenis smooth scroll,
  React Three Fiber 3D (with graceful fallbacks), and a **consent-first**
  Web Audio engine (never autoplay).
- SEO (JSON-LD, sitemap, robots), WCAG-minded a11y, security headers, RBAC,
  rate limiting, audit logs.

---

## 2. Tech Stack

| Layer        | Technology |
|--------------|------------|
| Framework    | Next.js 15 (App Router), React 19, TypeScript |
| Styling      | Tailwind CSS, shadcn/ui-style components, design tokens (HSL) |
| Motion / 3D  | Framer Motion, GSAP + ScrollTrigger, Lenis, React Three Fiber, Drei |
| State        | Zustand (persist), TanStack Query |
| Data         | Prisma ORM · SQLite (dev, zero-config) / PostgreSQL (prod) |
| Cache/Rate   | Redis abstraction with in-memory fallback |
| Auth         | Auth.js v5 (JWT, Credentials, PrismaAdapter), RBAC |
| Payments     | Razorpay (HMAC-SHA256 verification) + mock mode |
| Email        | Resend + dev logging fallback (idempotent) |
| Storage      | S3 presigned uploads (validated) |
| Audio        | Self-contained Web Audio API synthesis (no external assets) |
| Testing      | Vitest (unit), Playwright (e2e) |
| DevOps       | Docker, docker-compose, GitHub Actions CI |

---

## 3. Getting Started

```bash
# 1. Create your env file (the exported zip omits the real .env on purpose)
cp .env.example .env

# 2. Install (legacy-peer-deps reconciles the 3D stack with React 19)
#    Stack is React 19 compatible: @react-three/fiber 9, drei 10, postprocessing 3
npm install --legacy-peer-deps

# 3. Set up the local database (SQLite, zero config) + seed demo data
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Run the dev server
npm run dev          # http://localhost:3000

# Production build
npm run build && npm run start
```

> `.env.example` ships with SQLite + mock payment/email keys, so copying it to
> `.env` lets the app run immediately with no external accounts. Add real keys to
> enable live Razorpay/Resend/OpenAI/S3.

### Demo accounts (from seed)
| Role        | Email                | Password    |
|-------------|----------------------|-------------|
| Super Admin | admin@karu.market    | password123 |
| Buyer       | buyer@karu.market    | password123 |
| Seller      | meera@karu.market    | password123 |

---

## 4. Functional Routes (URIs)

### Public / Shopping
| Path | Description |
|------|-------------|
| `/` | Cinematic landing (hero, 3D, story, featured) |
| `/discover?q=&category=&minPrice=&maxPrice=&sort=&page=` | Search & browse with filters and pagination |
| `/product/[slug]` | Product detail (gallery, 3D viewer, AI review summary, reviews, JSON-LD) |
| `/stores` | Directory of verified artisan stores |
| `/stores/[slug]` | Storefront (banner, story, full collection) |
| `/campaigns/[slug]` | Seasonal/curated campaign (e.g. `/campaigns/diwali`) |
| `/sell` | Seller landing + create-store flow |
| `/about` | Brand story & values |
| `/support` | AI support assistant + FAQ |

### Auth
| Path | Description |
|------|-------------|
| `/sign-in?callbackUrl=` | Sign in (Credentials) |
| `/sign-up` | Register (bcrypt, welcome email) |

### Buyer (auth required)
| Path | Description |
|------|-------------|
| `/cart` | Cart review |
| `/checkout` | Address + Razorpay payment (mock mode supported) |
| `/account` | Dashboard (orders, points) |
| `/account/orders` | Order history |
| `/account/addresses` | Saved addresses |
| `/wishlist` | Saved products |

### Seller Studio (SELLER+ required)
| Path | Description |
|------|-------------|
| `/seller` | Overview (revenue, units, rating, recent orders) |
| `/seller/products` | Catalogue management |
| `/seller/products/new` | Create product (AI-assisted copy & auto-tags) |
| `/seller/orders` | Fulfillment queue |

### Admin (SUPPORT+ / ADMIN required)
| Path | Description |
|------|-------------|
| `/admin` | Platform KPIs (GMV, users, stores, moderation queue) |
| `/admin/sellers` | Approve / review stores |
| `/admin/moderation` | Moderate products & reviews |
| `/admin/users` | User management & suspension |
| `/admin/orders` | All orders |

### API
| Path | Method | Description |
|------|--------|-------------|
| `/api/auth/[...nextauth]` | * | Auth.js handlers |
| `/api/products` | GET | Product listing (rate-limited) |
| `/api/search?q=&mode=suggest\|full` | GET | Search / autosuggest |
| `/api/ai` | POST | AI dispatch (`describe`, `tag`, `summarize`, `translate`, `campaign`, `support`) |
| `/api/webhooks/razorpay` | POST | Payment webhook (signature-verified) |
| `/sitemap.xml`, `/robots.txt` | GET | SEO |

---

## 5. Data Architecture

- **ORM/Models:** Prisma. Core entities — `User`, `Store`, `Category`,
  `Product` (+ `ProductVariant`, `Media`, `Inventory`), `Cart`/`CartItem`,
  `Order`/`OrderItem`, `Payment`, `Refund`, `Review`, `WishlistItem`,
  `Address`, `Conversation`/`Message`, `Notification`, `SupportTicket`,
  `AnalyticsEvent`, `AuditLog`, `Campaign`.
- **Money:** stored as **integer paise** to avoid float errors.
- **Tags:** comma-separated strings for SQLite portability.
- **Storage services:** SQLite locally (Postgres in prod via `DATABASE_URL`),
  Redis (with in-memory fallback) for cache & rate limiting, S3 for media.
- **Data flow:** Server Components/Actions → service layer (`src/server/services`)
  → Prisma → DB; mutations revalidate affected paths and write audit logs.

---

## 6. Security & Reliability

- RBAC enforced in route-group layouts; edge `middleware.ts` gates protected
  prefixes on session presence.
- Payment & webhook signatures verified with HMAC-SHA256 + `timingSafeEqual`.
- Idempotency keys on payment confirmation & email sends.
- Rate limiting on public APIs; security headers in `next.config.mjs`.
- Inventory reserved transactionally at order creation.

---

## 7. Testing

```bash
npm run test       # Vitest unit tests (utils, RBAC, payments) — 23 tests
npm run test:e2e   # Playwright smoke suite (landing, discover, auth, 404, RBAC redirect)
```

---

## 8. Deployment

- **Container:** `docker compose up --build` brings up Postgres + Redis + the
  app (multi-stage `Dockerfile`).
- **CI:** `.github/workflows/ci.yml` runs lint/typecheck/unit → build → e2e.
- **Status:** ✅ Runnable locally (SQLite + mock keys). Production-ready with
  real `DATABASE_URL` (Postgres), `AUTH_SECRET`, and optional Razorpay/Resend/
  OpenAI/S3 credentials.
- **Last Updated:** 2026-06-20

---

## 9. Roadmap / Not Yet Implemented

- Realtime buyer–seller chat (current schema supports messages; UI is pending —
  edge runtime constraints mean a websocket provider would be integrated here).
- Full KYC document upload pipeline (schema + statuses present).
- Multi-currency checkout & international shipping rate cards.
- Recommendation engine v2 (vector search) — current search uses typo-tolerant
  keyword matching with local heuristics.
