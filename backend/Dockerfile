# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: deps — instala solo dependencias de producción (cache óptimo)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache wget
COPY package-lock.json package.json ./
RUN npm ci --omit=dev

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: build — instala dev deps, compila TypeScript
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: development — hot reload; código fuente montado como volumen
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS development
WORKDIR /app
ENV NODE_ENV=development
RUN apk add --no-cache wget
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4: production — imagen mínima, usuario no-root, sin código fuente
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache wget \
  && addgroup -g 1001 -S nodejs \
  && adduser  -S nestjs -u 1001

# Copiar artefactos de compilación y dependencias de producción únicamente
COPY --from=build --chown=nestjs:nodejs /app/dist         ./dist
COPY --from=deps  --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json

ENV NODE_ENV=production
USER nestjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/v1/health || exit 1

CMD ["node", "dist/main"]
