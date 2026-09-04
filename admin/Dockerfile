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

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true
ENV AUTH_SECRET=$AUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL

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

# Bootstrap: prisma CLI global + schema để tự migrate DB lúc container
# start. Cần thiết khi deploy lên nền tảng có DB Postgres mới trống
# (Tinhgon, Vercel Postgres...). Với DB đã có bảng, "db push" là no-op.
RUN npm install -g prisma@6.19.3
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000
CMD ["sh", "-c", "prisma db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss || echo '⚠️  DB migration skipped (check DATABASE_URL env)'; node server.js"]
