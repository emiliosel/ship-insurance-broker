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
COPY apps/backend/notification-service/package.json ./apps/backend/notification-service/package.json

# Install dependencies including dev dependencies
RUN pnpm install

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY apps/backend/notification-service/ ./apps/backend/notification-service/

RUN pnpm build

# Production Stage
FROM node:22-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/apps/backend/notification-service/package.json ./apps/backend/notification-service/package.json

# Install pnpm and production dependencies
RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/notification-service/dist ./apps/backend/notification-service/dist

# Set permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "apps/backend/notification-service/dist/main.js"]
