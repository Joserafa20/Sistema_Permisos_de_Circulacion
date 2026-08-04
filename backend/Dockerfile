# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: base — imagen compartida, solo dependencias de producción declaradas
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache wget
COPY package*.json ./

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: development — hot reload; el código fuente se monta como volumen
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: build — compila TypeScript y poda dev-dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS build
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4: production — imagen mínima, sin código fuente ni dev tools
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache wget \
  && addgroup -g 1001 -S nodejs \
  && adduser  -S nestjs -u 1001
COPY --from=build --chown=nestjs:nodejs /app/dist        ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
ENV NODE_ENV=production
USER nestjs
EXPOSE 3001
CMD ["node", "dist/main"]
