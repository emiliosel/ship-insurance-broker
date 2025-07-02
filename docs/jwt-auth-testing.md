# JWT Authentication Testing Guide

This guide explains how to test the JWT authentication functionality in the Marine Insurance Quote System.

## Overview

The system uses JWT (JSON Web Token) authentication with RS256 algorithm for secure access. All endpoints (except `/health`) require a valid JWT token with appropriate role claims.

JWT tokens contain the following claims:
- `sub`: User ID (UUID)
- `email`: User's email address
- `companyId`: Company ID (UUID) for tenant isolation
- `roles`: User's roles (e.g., 'requester', 'responder')
- `iat`: Token issued at timestamp
- `exp`: Token expiration timestamp

## Generating Test Tokens

We've provided a script to generate JWT tokens for testing purposes. The script generates a new RSA key pair and creates tokens for both requester and responder roles.

### Running the Token Generator

```bash
# Navigate to the shared package directory
cd packages/shared

# Run the token generator script
npx tsx src/auth/generate-jwt.ts
```

The script will:
1. Generate a new RSA key pair
2. Save the public key to `public-key.pem` in the project root
3. Generate a JWT token for a requester
4. Generate a JWT token for a responder
5. Print instructions for updating your `.env` file with the public key

### Updating Environment Variables

After running the script, copy the public key output and update your `.env` file:

```
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

## Testing with Generated Tokens

### Using cURL

```bash
# Test a protected endpoint with a requester token
curl -X GET http://localhost:3000/api/quotes/requester/YOUR_REQUESTER_ID \
  -H "Authorization: Bearer YOUR_REQUESTER_TOKEN"

# Test a protected endpoint with a responder token
curl -X GET http://localhost:3000/api/quotes/responder/YOUR_RESPONDER_ID/pending \
  -H "Authorization: Bearer YOUR_RESPONDER_TOKEN"
```

### Using Swagger UI

1. Open the Swagger UI at `http://localhost:8080/api/docs`
2. Click the "Authorize" button
3. Enter your JWT token in the format: `Bearer YOUR_TOKEN`
4. Click "Authorize" to apply the token to all requests
5. Test the endpoints with the authorized session

## Role-Based Access Control

The system enforces role-based access control through the `RolesGuard`. Each endpoint is decorated with the required roles:

- `@Roles('requester')`: Only users with the 'requester' role can access
- `@Roles('responder')`: Only users with the 'responder' role can access
- `@Public()`: Public endpoint, no authentication required

## Tenant Isolation

The system enforces tenant isolation through the `TenantGuard`. This ensures that users can only access data that belongs to their company.

When testing endpoints that require tenant isolation, make sure to use the correct company ID in your requests.

## Troubleshooting

### Invalid Token

If you receive a 401 Unauthorized error, check:
- The token hasn't expired
- You're using the correct token format (`Bearer YOUR_TOKEN`)
- The public key in your `.env` file matches the one used to sign the token

### Forbidden Access

If you receive a 403 Forbidden error, check:
- Your token has the required role for the endpoint
- Your token has the correct company ID for tenant-isolated endpoints

### Internal Server Error

If you receive a 500 Internal Server Error, check:
- The JWT_PUBLIC_KEY environment variable is correctly set
- The server logs for more detailed error information
