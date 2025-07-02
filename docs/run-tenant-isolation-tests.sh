#!/bin/bash

# Run tenant isolation tests
# This script runs the curl commands in sequence to test tenant isolation

# Set up colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up test environment...${NC}"

# Use proper UUIDs for responder companies
REQUESTER_A_ID="496efeff-28a5-43a1-9813-dadb5f298e7e"
RESPONDER_B_ID="396efeff-28a5-43a1-9813-dadb5f298e6e"
RESPONDER_C_ID="90185984-ad75-4025-8dfc-6e9eaa36cfd6"

# Generate tokens
echo -e "${YELLOW}Generating JWT tokens...${NC}"
cd packages/shared && npx tsx src/auth/generate-jwt.ts --userId=user-a-1 --email=requester@companya.com --companyId=$REQUESTER_A_ID --roles=requester > ../../requester_token.txt
cd ../.. && echo -e "${GREEN}Generated requester token${NC}"



cd packages/shared && npx tsx src/auth/generate-jwt.ts --userId=user-b-1 --email=responder@companyb.com --companyId=$RESPONDER_B_ID --roles=responder > ../../responder_b_token.txt
cd ../.. && echo -e "${GREEN}Generated responder B token${NC}"

cd packages/shared && npx tsx src/auth/generate-jwt.ts --userId=user-c-1 --email=responder@companyc.com --companyId=$RESPONDER_C_ID --roles=responder > ../../responder_c_token.txt
cd ../.. && echo -e "${GREEN}Generated responder C token${NC}"

# Save tokens to environment variables
export REQUESTER_TOKEN=$(cat requester_token.txt)
export RESPONDER_B_TOKEN=$(cat responder_b_token.txt)
export RESPONDER_C_TOKEN=$(cat responder_c_token.txt)

# Test 1: Create a Quote Request as Company A
echo -e "\n${YELLOW}Test 1: Create a Quote Request as Company A${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3000/quote-requests \
  -H "Authorization: Bearer $REQUESTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "voyageData": {
      "departurePort": {
        "code": "SGSIN",
        "name": "Singapore"
      },
      "destinationPort": {
        "code": "USNYC",
        "name": "New York"
      },
      "cargoType": "CONTAINER",
      "cargoWeight": 5000,
      "vesselType": "CONTAINER_SHIP",
      "departureDate": "2025-07-10T00:00:00.000Z"
    },
    "responderIds": ["396efeff-28a5-43a1-9813-dadb5f298e6e", "90185984-ad75-4025-8dfc-6e9eaa36cfd6"]
  }')

# Extract quote request ID from response
QUOTE_REQUEST_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$QUOTE_REQUEST_ID" ]; then
  echo -e "${RED}Failed to create quote request${NC}"
  echo $RESPONSE
  exit 1
else
  echo -e "${GREEN}Created quote request: $QUOTE_REQUEST_ID${NC}"
fi

# Test 2: Company A Can View Its Own Quote Requests
echo -e "\n${YELLOW}Test 2: Company A Can View Its Own Quote Requests${NC}"
RESPONSE=$(curl -s -X GET http://localhost:3000/quote-requests/my-requests \
  -H "Authorization: Bearer $REQUESTER_TOKEN")

REQUEST_COUNT=$(echo $RESPONSE | grep -o '"id"' | wc -l)
echo -e "${GREEN}Company A can view $REQUEST_COUNT quote requests${NC}"

# Test 3: Company B Can View Pending Quote Requests Assigned to It
echo -e "\n${YELLOW}Test 3: Company B Can View Pending Quote Requests Assigned to It${NC}"
RESPONSE=$(curl -s -X GET http://localhost:3000/quote-requests/my-pending-requests \
  -H "Authorization: Bearer $RESPONDER_B_TOKEN")

REQUEST_COUNT=$(echo $RESPONSE | grep -o '"id"' | wc -l)
echo -e "${GREEN}Company B can view $REQUEST_COUNT pending quote requests${NC}"

# Test 4: Company C Can View Pending Quote Requests Assigned to It
echo -e "\n${YELLOW}Test 4: Company C Can View Pending Quote Requests Assigned to It${NC}"
RESPONSE=$(curl -s -X GET http://localhost:3000/quote-requests/my-pending-requests \
  -H "Authorization: Bearer $RESPONDER_C_TOKEN")

REQUEST_COUNT=$(echo $RESPONSE | grep -o '"id"' | wc -l)
echo -e "${GREEN}Company C can view $REQUEST_COUNT pending quote requests${NC}"

# Test 5: Company B Submits a Response
echo -e "\n${YELLOW}Test 5: Company B Submits a Response${NC}"
RESPONSE=$(curl -s -X PUT http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID/response \
  -H "Authorization: Bearer $RESPONDER_B_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1000,
    "comments": "Offer from Company B"
  }')

if [[ $RESPONSE == *"price"* ]]; then
  echo -e "${GREEN}Company B submitted a response${NC}"
else
  echo -e "${RED}Failed to submit response${NC}"
  echo $RESPONSE
fi

# Test 6: Company C Submits a Response
echo -e "\n${YELLOW}Test 6: Company C Submits a Response${NC}"
RESPONSE=$(curl -s -X PUT http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID/response \
  -H "Authorization: Bearer $RESPONDER_C_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1200,
    "comments": "Offer from Company C"
  }')

if [[ $RESPONSE == *"price"* ]]; then
  echo -e "${GREEN}Company C submitted a response${NC}"
else
  echo -e "${RED}Failed to submit response${NC}"
  echo $RESPONSE
fi

# Test 7: Company A Accepts Company B's Response
echo -e "\n${YELLOW}Test 7: Company A Accepts Company B's Response${NC}"
RESPONSE=$(curl -s -X PUT http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID/accept/$RESPONDER_B_ID \
  -H "Authorization: Bearer $REQUESTER_TOKEN")

if [[ $RESPONSE == *"ACCEPTED"* ]]; then
  echo -e "${GREEN}Company A accepted Company B's response${NC}"
else
  echo -e "${RED}Failed to accept response${NC}"
  echo $RESPONSE
fi

# Test 8: Tenant Isolation - Company B Cannot Accept Responses
echo -e "\n${YELLOW}Test 8: Tenant Isolation - Company B Cannot Accept Responses${NC}"
RESPONSE=$(curl -s -X PUT http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID/accept/$RESPONDER_B_ID \
  -H "Authorization: Bearer $RESPONDER_B_TOKEN")

if [[ $RESPONSE == *"Forbidden"* || $RESPONSE == *"forbidden"* || $RESPONSE == *"not authorized"* ]]; then
  echo -e "${GREEN}Company B cannot accept responses (correctly forbidden)${NC}"
else
  echo -e "${RED}Company B was able to accept a response (should be forbidden)${NC}"
  echo $RESPONSE
fi

# Test 9: Create Another Quote Request for Cancellation Test
echo -e "\n${YELLOW}Test 9: Create Another Quote Request for Cancellation Test${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3000/quote-requests \
  -H "Authorization: Bearer $REQUESTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "voyageData": {
      "departurePort": {
        "code": "SGSIN",
        "name": "Singapore"
      },
      "destinationPort": {
        "code": "USNYC",
        "name": "New York"
      },
      "cargoType": "CONTAINER",
      "cargoWeight": 5000,
      "vesselType": "CONTAINER_SHIP",
      "departureDate": "2025-07-10T00:00:00.000Z"
    },
    "responderIds": ["396efeff-28a5-43a1-9813-dadb5f298e6e", "90185984-ad75-4025-8dfc-6e9eaa36cfd6"]
  }')

# Extract quote request ID from response
QUOTE_REQUEST_ID_2=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$QUOTE_REQUEST_ID_2" ]; then
  echo -e "${RED}Failed to create quote request${NC}"
  echo $RESPONSE
  exit 1
else
  echo -e "${GREEN}Created quote request: $QUOTE_REQUEST_ID_2${NC}"
fi

# Test 10: Company A Cancels the Quote Request
echo -e "\n${YELLOW}Test 10: Company A Cancels the Quote Request${NC}"
RESPONSE=$(curl -s -X DELETE http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID_2 \
  -H "Authorization: Bearer $REQUESTER_TOKEN")

if [[ $RESPONSE == *"CANCELLED"* ]]; then
  echo -e "${GREEN}Company A cancelled the quote request${NC}"
else
  echo -e "${RED}Failed to cancel quote request${NC}"
  echo $RESPONSE
fi

# Test 11: Tenant Isolation - Company B Cannot Cancel the Quote Request
echo -e "\n${YELLOW}Test 11: Tenant Isolation - Company B Cannot Cancel the Quote Request${NC}"
RESPONSE=$(curl -s -X DELETE http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID \
  -H "Authorization: Bearer $RESPONDER_B_TOKEN")

if [[ $RESPONSE == *"Forbidden"* || $RESPONSE == *"forbidden"* || $RESPONSE == *"not authorized"* ]]; then
  echo -e "${GREEN}Company B cannot cancel quote requests (correctly forbidden)${NC}"
else
  echo -e "${RED}Company B was able to cancel a quote request (should be forbidden)${NC}"
  echo $RESPONSE
fi

# Test 12: Create a Quote Request Assigned Only to Company B
echo -e "\n${YELLOW}Test 12: Create a Quote Request Assigned Only to Company B${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3000/quote-requests \
  -H "Authorization: Bearer $REQUESTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "voyageData": {
      "departurePort": {
        "code": "SGSIN",
        "name": "Singapore"
      },
      "destinationPort": {
        "code": "USNYC",
        "name": "New York"
      },
      "cargoType": "CONTAINER",
      "cargoWeight": 5000,
      "vesselType": "CONTAINER_SHIP",
      "departureDate": "2025-07-10T00:00:00.000Z"
    },
    "responderIds": ["396efeff-28a5-43a1-9813-dadb5f298e6e"]
  }')

# Extract quote request ID from response
QUOTE_REQUEST_ID_3=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$QUOTE_REQUEST_ID_3" ]; then
  echo -e "${RED}Failed to create quote request${NC}"
  echo $RESPONSE
  exit 1
else
  echo -e "${GREEN}Created quote request: $QUOTE_REQUEST_ID_3${NC}"
fi

# Test 13: Tenant Isolation - Company C Cannot Submit a Response to a Non-Assigned Quote Request
echo -e "\n${YELLOW}Test 13: Tenant Isolation - Company C Cannot Submit a Response to a Non-Assigned Quote Request${NC}"
RESPONSE=$(curl -s -X PUT http://localhost:3000/quote-requests/$QUOTE_REQUEST_ID_3/response \
  -H "Authorization: Bearer $RESPONDER_C_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1500,
    "comments": "Offer from Company C"
  }')

if [[ $RESPONSE == *"not found"* || $RESPONSE == *"Not Found"* || $RESPONSE == *"ResponderNotFoundException"* ]]; then
  echo -e "${GREEN}Company C cannot submit a response to a non-assigned quote request (correctly forbidden)${NC}"
else
  echo -e "${RED}Company C was able to submit a response to a non-assigned quote request (should be forbidden)${NC}"
  echo $RESPONSE
fi

echo -e "\n${GREEN}All tenant isolation tests completed!${NC}"

# Clean up
rm requester_token.txt responder_b_token.txt responder_c_token.txt
