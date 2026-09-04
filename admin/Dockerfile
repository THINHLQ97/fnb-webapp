ARG NODE_VERSION=22-slim

# Stage 1: Install dependencies
FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Stage 2: Build
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public

# Vibe Hosting truyền các biến này qua --build-arg
ARG AUTH_SECRET
ARG DATABASE_URL
ARG KIOTVIET_BASE_URL
ARG KIOTVIET_CLIENT_ID
ARG KIOTVIET_CLIENT_SECRET
ARG KIOTVIET_RETAILER

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true
ENV AUTH_SECRET=$AUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV KIOTVIET_BASE_URL=$KIOTVIET_BASE_URL
ENV KIOTVIET_CLIENT_ID=$KIOTVIET_CLIENT_ID
ENV KIOTVIET_CLIENT_SECRET=$KIOTVIET_CLIENT_SECRET
ENV KIOTVIET_RETAILER=$KIOTVIET_RETAILER

RUN npx prisma generate && npm run build

# Stage 3: Run
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Bootstrap: prisma CLI + schema để tự migrate DB lúc container start.
# Cần thiết khi deploy lên nền tảng có DB Postgres mới trống (Tinhgon,
# Vercel Postgres...). Với DB đã có bảng, "db push" là no-op.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000
CMD ["sh", "-c", "node node_modules/prisma/build/index.js db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss && node server.js"]
