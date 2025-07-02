# Quote Service

Part of the Marine Insurance Quote System, this service handles the creation and management of quote requests between requesters and responders.

## Features

- Create quote requests for marine insurance
- Assign multiple responders to a quote request
- Submit and manage quote responses
- Accept/reject quote responses
- Real-time notifications via RabbitMQ
- JWT authentication with role-based access control
- Multi-tenant isolation
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
docker-compose up -d

# Start service
pnpm start:dev
```

## API Documentation

Once the service is running, access the Swagger documentation at:
```
http://localhost:8080/api/docs
```

## Authentication

The service uses JWT authentication with RS256 algorithm for secure access. All endpoints (except `/health`) require a valid JWT token with appropriate role claims.

For detailed information on how to test the authentication functionality, see the [JWT Authentication Testing Guide](../../../docs/jwt-auth-testing.md).

## Tenant Isolation

The service implements multi-tenant isolation to ensure that companies can only access their own data:

1. **Company ID as Tenant ID**: The system uses company IDs as tenant identifiers, stored in the JWT token.
2. **Service-Layer Enforcement**: Tenant isolation is enforced at the service layer by passing the company ID from the JWT token and checking it against the requesterId or responderId in the database.
3. **Role-Based Access Control**: Combined with RBAC to ensure users can only perform actions appropriate to their role (requester/responder).
4. **Data Filtering**: All queries filter data by company ID to ensure users only see their own data.

### Testing Tenant Isolation

To test the tenant isolation implementation, use the provided test scripts:

```bash
# Make the test script executable
chmod +x docs/run-tenant-isolation-tests.sh

# Run the tenant isolation tests
./docs/run-tenant-isolation-tests.sh
```

The test script performs the following checks:
- Company A (requester) can create and view its own quote requests
- Companies B and C (responders) can only view quote requests assigned to them
- Companies B and C can submit responses to quote requests they're assigned to
- Company A can accept responses
- Company B cannot accept responses (tenant isolation)
- Company A can cancel quote requests
- Company B cannot cancel quote requests (tenant isolation)
- Company C cannot submit responses to quote requests it's not assigned to (tenant isolation)

For individual curl commands, see [Tenant Isolation Testing](../../../docs/tenant-isolation-test.md).

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
├── config/           # Configuration
├── domain/           # Domain entities and logic
└── infrastructure/   # External services and persistence
```

The authentication system is implemented using the shared auth module from the `@quote-system/shared` package, which provides:

- JWT validation using public key
- Role-based access control (Requester/Responder roles)
- Tenant isolation
- Public endpoint decorator

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
- `quote_request.response_accepted` - Quote response accepted
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
