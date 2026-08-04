# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: deps — dependencias de producción (cache optimizado)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache wget
COPY package-lock.json package.json ./
RUN npm ci --omit=dev

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: build — compila Next.js en modo standalone
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: development — hot reload con código montado como volumen
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS development
WORKDIR /app
ENV NODE_ENV=development
RUN apk add --no-cache wget
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4: production — imagen mínima con output standalone de Next.js
# Requiere next.config.js con: output: 'standalone'
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache wget \
  && addgroup -g 1001 -S nodejs \
  && adduser  -S nextjs -u 1001

# standalone ya incluye su propio node_modules mínimo — no copiar los del host
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public           ./public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=30s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
