# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy package files
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/backend/quote-service/package.json ./apps/backend/quote-service/package.json

# Install dependencies
RUN pnpm install

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY apps/backend/quote-service/ ./apps/backend/quote-service/

# Build shared package first
RUN pnpm --filter @quote-system/shared build

# Build quote service
RUN pnpm --filter @quote-system/quote-service build

# Production Stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy package files
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/backend/quote-service/package.json ./apps/backend/quote-service/package.json

# Install production dependencies
RUN pnpm install --prod

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/quote-service/dist ./apps/backend/quote-service/dist

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "apps/backend/quote-service/dist/main"]
