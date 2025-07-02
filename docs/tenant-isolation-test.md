# Tenant Isolation Testing

This document contains curl commands to test the tenant isolation implementation in the quote service.

## Setup

First, we need to generate JWT tokens for different users with different roles and company IDs. We'll use the `generate-jwt.ts` script in the shared package.

```bash
# Generate token for a requester user in Company A
cd packages/shared && npx tsx src/auth/generate-jwt.ts --userId=user-a-1 --email=requester@companya.com --companyId=11111111-1111-1111-1111-111111111111 --roles=requester > ../../requester_token.txt

# Generate token for a responder user in Company B
cd packages/shared && npx tsx src/auth/generate-jwt.ts --userId=user-b-1 --email=responder@companyb.com --companyId=22222222-2222-2222-2222-222222222222 --roles=responder > ../../responder_b_token.txt

# Generate token for a responder user in Company C
cd packages/shared && npx tsx src/auth/generate-jwt.ts --userId=user-c-1 --email=responder@companyc.com --companyId=33333333-3333-3333-3333-333333333333 --roles=responder > ../../responder_c_token.txt
```

Save these tokens to environment variables for easier use:

```bash
export REQUESTER_TOKEN=$(cat requester_token.txt)
export RESPONDER_B_TOKEN=$(cat responder_b_token.txt)
export RESPONDER_C_TOKEN=$(cat responder_c_token.txt)
```

## Test 1: Create a Quote Request as Company A

```bash
curl -X POST http://localhost:3000/quote-requests \
  -H "Authorization: Bearer $REQUESTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "voyageData": {
      "vesselName": "Test Vessel",
      "cargoType": "General",
      "departurePort": "Port A",
      "destinationPort": "Port B",
      "departureDate": "2025-07-10T00:00:00.000Z",
      "estimatedArrivalDate": "2025-07-17T00:00:00.000Z"
    },
    "responderIds": ["22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333"]
  }'
```

Save the quote request ID from the response:

```bash
export QUOTE_REQUEST_ID=<quote_request_id_from_response>
```

## Test 2: Company A Can View Its Own Quote Requests

```bash
curl -X GET http://localhost:3000/quote-requests/my-requests \
  -H "Authorization: Bearer $REQUESTER_TOKEN"
```

## Test 3: Company B Can View Pending Quote Requests Assigned to It

```bash
curl -X GET http://localhost:3000/quote-requests/my-pending-requests \
  -H "Authorization: Bearer $RESPONDER_B_TOKEN"
```

## Test 4: Company C Can View Pending Quote Requests Assigned to It

```bash
curl -X GET http://localhost:3000/quote-requests/my-pending-requests \
  -H "Authorization: Bearer $RESPONDER_C_TOKEN"
```

## Test 5: Company B Submits a Response

```bash
curl -X PUT http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID/response \
  -H "Authorization: Bearer $RESPONDER_B_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1000,
    "comments": "Offer from Company B"
  }'
```

## Test 6: Company C Submits a Response

```bash
curl -X PUT http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID/response \
  -H "Authorization: Bearer $RESPONDER_C_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1200,
    "comments": "Offer from Company C"
  }'
```

## Test 7: Company A Accepts Company B's Response

```bash
curl -X PUT http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID/accept/22222222-2222-2222-2222-222222222222 \
  -H "Authorization: Bearer $REQUESTER_TOKEN"
```

## Test 8: Tenant Isolation - Company B Cannot Accept Responses

```bash
# This should fail with a 403 Forbidden error
curl -X PUT http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID/accept/22222222-2222-2222-2222-222222222222 \
  -H "Authorization: Bearer $RESPONDER_B_TOKEN"
```

## Test 9: Create Another Quote Request for Cancellation Test

```bash
curl -X POST http://localhost:3000/quote-requests \
  -H "Authorization: Bearer $REQUESTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "voyageData": {
      "vesselName": "Test Vessel 2",
      "cargoType": "General",
      "departurePort": "Port A",
      "destinationPort": "Port B",
      "departureDate": "2025-07-10T00:00:00.000Z",
      "estimatedArrivalDate": "2025-07-17T00:00:00.000Z"
    },
    "responderIds": ["22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333"]
  }'
```

Save the quote request ID from the response:

```bash
export QUOTE_REQUEST_ID_2=<quote_request_id_from_response>
```

## Test 10: Company A Cancels the Quote Request

```bash
curl -X DELETE http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID_2 \
  -H "Authorization: Bearer $REQUESTER_TOKEN"
```

## Test 11: Tenant Isolation - Company B Cannot Cancel the Quote Request

```bash
# This should fail with a 403 Forbidden error
curl -X DELETE http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID \
  -H "Authorization: Bearer $RESPONDER_B_TOKEN"
```

## Test 12: Create a Quote Request Assigned Only to Company B

```bash
curl -X POST http://localhost:3000/quote-requests \
  -H "Authorization: Bearer $REQUESTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "voyageData": {
      "vesselName": "Test Vessel 3",
      "cargoType": "General",
      "departurePort": "Port A",
      "destinationPort": "Port B",
      "departureDate": "2025-07-10T00:00:00.000Z",
      "estimatedArrivalDate": "2025-07-17T00:00:00.000Z"
    },
    "responderIds": ["22222222-2222-2222-2222-222222222222"]
  }'
```

Save the quote request ID from the response:

```bash
export QUOTE_REQUEST_ID_3=<quote_request_id_from_response>
```

## Test 13: Tenant Isolation - Company C Cannot Submit a Response to a Non-Assigned Quote Request

```bash
# This should fail with a 404 Not Found error (ResponderNotFoundException)
curl -X PUT http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID_3/response \
  -H "Authorization: Bearer $RESPONDER_C_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1500,
    "comments": "Offer from Company C"
  }'
