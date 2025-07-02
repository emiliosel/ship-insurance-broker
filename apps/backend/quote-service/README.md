# Quote Service

Part of the Marine Insurance Quote System, this service handles the creation and management of quote requests between requesters and responders.

## Features

- Create quote requests for marine insurance
- Assign multiple responders to a quote request
- Submit and manage quote responses
- Accept/reject quote responses
- Real-time notifications via RabbitMQ
- Health monitoring
- OpenAPI documentation

## Tech Stack

- Node.js with NestJS framework
- PostgreSQL for data persistence
- RabbitMQ for event messaging
- Docker for containerization
- Nginx for API gateway
- Swagger for API documentation

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- pnpm package manager

## Configuration

Environment variables can be configured in `.env` file:

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=quote_service

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=quote_requests
```

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start development environment
docker-compose up -d

# Start service
pnpm start:dev
```

## API Documentation

Once the service is running, access the Swagger documentation at:
```
http://localhost:8080/api/docs
```

## API Endpoints

### Quote Requests

- `POST /api/quotes` - Create a new quote request
- `GET /api/quotes/requester/:requesterId` - Get quotes by requester
- `PUT /api/quotes/:quoteRequestId/responses` - Submit response to quote
- `PUT /api/quotes/:quoteRequestId/accept/:responderId` - Accept a quote response
- `PUT /api/quotes/:quoteRequestId/cancel` - Cancel a quote request
- `GET /api/quotes/responder/:responderId/pending` - Get pending quotes for responder

### Health Check

- `GET /health` - Service health status

## Docker Support

Build the container:
```bash
docker build -t quote-service .
```

Run with Docker Compose:
```bash
docker-compose up -d
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

## Event Messages

The service emits the following events via RabbitMQ:

- `quote_request.created` - New quote request created
- `quote_request.response_submitted` - Response submitted to quote
- `quote_request.response_decision` - Quote response accepted/rejected
- `quote_request.cancelled` - Quote request cancelled

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
