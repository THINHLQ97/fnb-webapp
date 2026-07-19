ARG NODE_VERSION=22-slim

FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY web/package.json web/package-lock.json* ./
RUN npm ci --ignore-scripts

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=dependencies /app/node_modules ./node_modules
# Shared prisma schema — cả admin + web đều tham chiếu ../prisma/schema.prisma
COPY prisma/ /prisma/
COPY web/ .
RUN mkdir -p public

# Vibe Hosting truyền các biến này qua --build-arg; khai báo để builder nhận
ARG AUTH_SECRET
ARG DATABASE_URL
ARG KIOTVIET_BASE_URL
ARG KIOTVIET_CLIENT_ID
ARG KIOTVIET_CLIENT_SECRET
ARG KIOTVIET_RETAILER

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV AUTH_SECRET=$AUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV KIOTVIET_BASE_URL=$KIOTVIET_BASE_URL
ENV KIOTVIET_CLIENT_ID=$KIOTVIET_CLIENT_ID
ENV KIOTVIET_CLIENT_SECRET=$KIOTVIET_CLIENT_SECRET
ENV KIOTVIET_RETAILER=$KIOTVIET_RETAILER

RUN npx prisma generate && npx next build

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
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
