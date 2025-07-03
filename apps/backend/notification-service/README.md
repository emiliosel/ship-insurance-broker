# Notification Service

Part of the Marine Insurance Quote System, this service handles asynchronous notifications and communication between requesters and responders.

## Features

- Event-driven notification processing
- In-app notifications for users
- Real-time notification delivery via RabbitMQ
- Multi-tenant notification isolation
- Health monitoring
- OpenAPI documentation

## Tech Stack

- Node.js with NestJS framework
- PostgreSQL for notification persistence
- RabbitMQ for event handling
- Docker for containerization
- Swagger for API documentation

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- pnpm package manager

## Configuration

Environment variables can be configured in `.env` file:

```env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=notification_service

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=notifications

# JWT Authentication
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start development environment
docker-compose up

# Start service
pnpm start:dev
```

## API Endpoints

### Notifications

- `GET /notifications/tenant` - Get user's notifications (paginated)

### Health Check

- `GET /health` - Service health status

## Event Handling

The service handles the following events from RabbitMQ:

### Quote Events
```typescript
// New quote request created
{
  type: 'QUOTE_REQUEST_CREATED',
  payload: {
    requestId: string;
    requesterId: string;
    responderIds: string[];
    voyageData: VoyageData;
  }
}

// Quote response submitted
{
  type: 'QUOTE_RESPONSE_SUBMITTED',
  payload: {
    requestId: string;
    requesterId: string;
    responderId: string;
    price: number;
  }
}

// Quote request accepted
{
  type: 'QUOTE_REQUEST_ACCEPTED',
  payload: {
    requestId: string;
    requesterId: string;
    responderId: string;
    rejectedResponderIds: string[];
  }
}
```

## Domain Model

### Notification Entity
```typescript
interface Notification {
  id: string;
  recipientId: string;
  type: string;
  payload: any;
  status: 'UNREAD' | 'READ';
  createdAt: Date;
  updatedAt: Date;
}
```

## Docker Support

Build the container:
```bash
docker build -t notification-service .
```

Run with Docker Compose:
```bash
docker-compose up
```

## Development

### Code Organization

```
src/
├── api/              # API layer (controllers, DTOs)
├── application/      # Application services
├── config/          # Configuration
├── domain/          # Domain entities and logic
└── infrastructure/  # External services and persistence
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Health Monitoring

The service exposes a health check endpoint at `/health` that monitors:
- Database connectivity
- RabbitMQ connection
- Overall service status

## Multi-tenancy

The notification service implements tenant isolation:
- Notifications are scoped to recipient companies
- JWT tokens contain company ID for authentication
- Database queries filter by recipientId
- Event handlers validate tenant context

## Error Handling

The service implements a centralized error handling mechanism with:
- Domain-specific exceptions
- HTTP status code mapping
- Consistent error response format

## Contributing

1. Create feature branch
2. Commit changes
3. Create pull request
4. Pass CI checks
5. Get review approval
