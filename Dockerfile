# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────
# Karu — production multi-stage build
# ─────────────────────────────────────────────

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
WORKDIR /app
# OpenSSL is required by Prisma at runtime.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# ── Dependencies ──────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* .npmrc* ./
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# ── Builder ───────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ── Runner ────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.mjs ./next.config.mjs

USER nextjs
EXPOSE 3000

# Push schema (idempotent) then start. For Postgres set DATABASE_URL accordingly.
CMD ["sh", "-c", "npx prisma migrate deploy 2>/dev/null || npx prisma db push --skip-generate; npm run start"]
