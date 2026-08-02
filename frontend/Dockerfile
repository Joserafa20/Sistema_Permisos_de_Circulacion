# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: base — dependencias comunes
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache wget
COPY package*.json ./

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: development — hot reload con código montado como volumen
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: build — compila Next.js en modo standalone
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS build
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4: production — imagen mínima con output standalone de Next.js
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache wget \
  && addgroup -g 1001 -S nodejs \
  && adduser  -S nextjs -u 1001

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public          ./public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
