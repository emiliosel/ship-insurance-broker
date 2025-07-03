# Shipping Quote System

A multi-tenant system for managing shipping quotes between cargo owners and shipping ensurance companies.

## Assumptions & Open Questions

1. **Multi-tenancy Model**
   - Each company (requester/responder) is a separate tenant
   - Companies can't access each other's data
   - Companies may act only as requesters or responders not both
   - User ↔ Company: A user belongs to exactly one company (tenant)
   - Roles: requester, responder
   - Responder visibility: Responders see only their QuoteAssignment, never other bids.

2. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (requester/responder roles)
   - Token includes company ID for tenant isolation

3. **Quote Request Flow**
   - QuoteRequest state: Draft → Submitted → Closed(Accepted | Rejected | Cancelled)
   - Drafts stay client‑side: Backend receives only the final Submit payload.
   - Requesters can submit quote requests to multiple responders
   - Responders can only see requests assigned to them
   - Responders can not see if Requester assigned to other Responders
   - Exactly‑one acceptance: Requester can accept one response; others auto‑rejected
   - Cancellation window: Allowed only before any response is accepted.
   - No file uploads: All payloads are JSON; attachments out‑of‑scope.

4. **Data Isolation**
   - Separate databases per service for scalability
   - Row-level tenant isolation in each service
   - Shared package for common authentication/authorization
   - Voyage data shape: Stored as a JSON blob; schema validation deferred to future iteration.

5. **Notifications**
   - Async notifications via RabbitMQ
   - Email/SMS integration not implemented in spike
   - Event-driven architecture for scalability
   - Notifications are pull: Frontend polls GET /notifications; WebSocket push is out‑of‑scope.

6. **Audit**
   - Async notifications via RabbitMQ
   - Audit log is append‑only: No updates/deletes; immutable history for compliance.
   - Tenant can se only their actions

7. **API**
   - API versioning: Single version (v1) for spike; path‑based versioning when needed.
   - Time‑zone: All timestamps stored as UTC; UI converts to locale.

## High-Level Data & Tenant Model

```mermaid
erDiagram
    Company {
        uuid id PK
        string name
        string[] roles
    }

    QuoteRequest {
        uuid id PK
        uuid requesterId FK
        json voyageData
        enum status
        timestamp createdAt
        timestamp updatedAt
    }

    ResponderAssignment {
        uuid id PK
        uuid quoteRequestId FK
        uuid responderId FK
        enum status
        decimal price
        string comments
        timestamp createdAt
        timestamp updatedAt
    }

    Notification {
        uuid id PK
        uuid recipientId FK
        string type
        json payload
        enum status
        timestamp createdAt
        timestamp updatedAt
    }

    Company ||--o{ QuoteRequest : "submits"
    Company ||--o{ ResponderAssignment : "responds"
    QuoteRequest ||--o{ ResponderAssignment : "has"
    Company ||--o{ Notification : "receives"
```

## API Design

### Submit Quote Request
```http
POST /api/quote-requests
Authorization: Bearer <jwt>
Content-Type: application/json

Request:
{
  "voyageData": {
    "departurePort": {
      "code": "CNSHA",
      "name": "Shanghai"
    },
    "destinationPort": {
      "code": "NLRTM",
      "name": "Rotterdam"
    },
    "cargoType": "CONTAINER",
    "cargoWeight": 25000,
    "vesselType": "CONTAINER_SHIP",
    "departureDate": "2024-08-15"
  },
  "responderIds": ["company-2", "company-3"]
}

Success Response (201 Created):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING",
  "voyageData": { ... },
  "createdAt": "2024-07-02T23:35:47.000Z"
}

Error Responses:
401 Unauthorized:
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid token"
}

403 Forbidden:
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Insufficient permissions"
}

400 Bad Request:
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "voyageData.cargoWeight",
      "message": "must be a positive number"
    }
  ]
}
```

### Send Quote Response
```http
POST /api/quote-requests/{requestId}/responses
Authorization: Bearer <jwt>
Content-Type: application/json

Request:
{
  "price": 50000.00,
  "comments": "Available vessel: MV EXAMPLE. Transit time: 30 days"
}

Success Response (201 Created):
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "SUBMITTED",
  "price": 50000.00,
  "comments": "Available vessel: MV EXAMPLE. Transit time: 30 days",
  "createdAt": "2024-07-02T23:35:47.000Z"
}

Error Responses:
404 Not Found:
{
  "statusCode": 404,
  "message": "Quote request not found"
}

409 Conflict:
{
  "statusCode": 409,
  "message": "Response already submitted"
}

403 Forbidden:
{
  "statusCode": 403,
  "message": "Not authorized to respond to this quote request"
}
```

### Accept Quote Response
```http
POST /api/quote-requests/{requestId}/responses/{responderId}/accept
Authorization: Bearer <jwt>
Content-Type: application/json

Success Response (200 OK):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ACCEPTED",
  "acceptedResponse": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "responderId": "company-2",
    "status": "ACCEPTED",
    "price": 50000.00
  },
  "updatedAt": "2024-07-02T23:35:47.000Z"
}

Error Responses:
404 Not Found:
{
  "statusCode": 404,
  "message": "Quote request or response not found"
}

409 Conflict:
{
  "statusCode": 409,
  "message": "Quote request already finalized"
}

403 Forbidden:
{
  "statusCode": 403,
  "message": "Not authorized to accept responses for this quote request"
}
```

## Architecture

```mermaid
graph TB
    subgraph Services
        QS[Quote Service]
        NS[Notification Service]
    end

    subgraph Databases
        QDB[(Quote DB)]
        NDB[(Notification DB)]
    end

    subgraph Message Bus
        RMQ{RabbitMQ}
    end

    subgraph Infrastructure
        NGINX[API Gateway]
        JWT[JWT Auth]
        RBAC[RBAC]
    end

    NGINX --> JWT
    JWT --> RBAC
    RBAC --> QS
    RBAC --> NS
    QS --> QDB
    NS --> NDB
    QS --> RMQ
    RMQ --> NS
```

## Code Structure

```
.
├── apps
│   └── backend
│       ├── notification-service
│       └── quote-service
├── packages
│   └── shared
└── docker-compose.yml
```

- **notification-service**: Handles notification delivery and management
- **quote-service**: Core service for quote request workflow
- **shared**: Common utilities, auth, and types

## CI/CD Pipeline

- GitHub Actions workflow with conditional execution
- Path-based triggers for service-specific builds
- Shared package changes trigger all service builds
- Docker images built and cached for each service
- pnpm workspace for dependency management

## Technical Trade-offs

1. **Tenant Isolation**
   - Row-level isolation vs separate databases
   - Chose row-level for simplicity and resource efficiency
   - JWT carries tenant context for consistent isolation

2. **RBAC Implementation**
   - Role checks in shared middleware
   - Roles stored in JWT claims
   - Trade-off between token size and database lookups

3. **Notification System**
   - Event-driven via RabbitMQ
   - Separate service for scalability
   - Basic implementation without external providers

4. **Spike Limitations**
   - No email/SMS integration
   - Basic error handling
   - Limited validation
   - No rate limiting
   - Minimal observability

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment files:
```bash
cp apps/backend/quote-service/.env.example apps/backend/quote-service/.env
cp apps/backend/notification-service/.env.example apps/backend/notification-service/.env
```

3. Start services:
```bash
docker-compose up -d
```

4. Run tests:
```bash
pnpm -r test
```

## Event-Driven Notifications

The notification service consumes events from RabbitMQ and processes them accordingly:

### Quote Request Events
```typescript
interface QuoteRequestCreatedEvent {
  type: 'QUOTE_REQUEST_CREATED';
  payload: {
    requestId: string;
    requesterId: string;
    responderIds: string[];
    voyageData: VoyageData;
  };
}

interface QuoteResponseSubmittedEvent {
  type: 'QUOTE_RESPONSE_SUBMITTED';
  payload: {
    requestId: string;
    requesterId: string;
    responderId: string;
    price: number;
  };
}

interface QuoteRequestAcceptedEvent {
  type: 'QUOTE_REQUEST_ACCEPTED';
  payload: {
    requestId: string;
    requesterId: string;
    responderId: string;
    rejectedResponderIds: string[];
  };
}
```

### Notification Types
1. **New Quote Request**
   - Triggered when: A requester creates a new quote request
   - Recipients: All assigned responders
   - Channel: In-app notification + Email (future)

2. **Quote Response Submitted**
   - Triggered when: A responder submits a quote
   - Recipients: Request creator
   - Channel: In-app notification + Email (future)

3. **Quote Response Accepted**
   - Triggered when: A requester accepts a quote
   - Recipients: Accepted responder and all rejected responders
   - Channel: In-app notification + Email (future)

## Sample Calls

Get a JWT token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"companyId": "company-1", "apiKey": "test-key"}'
```

### Quote Requests
```bash
# Submit a quote request
curl -X POST http://localhost:3000/api/quote-requests \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "voyageData": {
      "departurePort": {"code": "CNSHA", "name": "Shanghai"},
      "destinationPort": {"code": "NLRTM", "name": "Rotterdam"},
      "cargoType": "CONTAINER",
      "cargoWeight": 25000,
      "vesselType": "CONTAINER_SHIP",
      "departureDate": "2024-08-15"
    },
    "responderIds": ["company-2", "company-3"]
  }'

# Get quote requests (as requester)
curl -X GET http://localhost:3000/api/quote-requests \
  -H 'Authorization: Bearer <token>'

# Get assigned quote requests (as responder)
curl -X GET http://localhost:3000/api/quote-requests/assigned \
  -H 'Authorization: Bearer <token>'

# Get quote request details
curl -X GET http://localhost:3000/api/quote-requests/{requestId} \
  -H 'Authorization: Bearer <token>'
```

### Quote Responses
```bash
# Submit a quote response
curl -X POST http://localhost:3000/api/quote-requests/{requestId}/responses \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "price": 50000.00,
    "comments": "Available vessel: MV EXAMPLE. Transit time: 30 days"
  }'

# Accept a quote response
curl -X POST http://localhost:3000/api/quote-requests/{requestId}/responses/{responderId}/accept \
  -H 'Authorization: Bearer <token>'
```

### Notifications
```bash
# Get notifications for current user
curl -X GET http://localhost:3000/api/notifications \
  -H 'Authorization: Bearer <token>'

# Mark notification as read
curl -X PATCH http://localhost:3000/api/notifications/{notificationId}/read \
  -H 'Authorization: Bearer <token>'
```
