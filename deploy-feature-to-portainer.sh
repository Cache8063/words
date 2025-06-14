#!/bin/bash

# Feature Branch Portainer Stack Deployment Script
# This deploys the feature branch with 6 attempts for testing

# Configuration - Update these values
PORTAINER_URL="${PORTAINER_URL:-https://ollama.cloudforest-basilisk.ts.net:9443}"
PORTAINER_TOKEN="${PORTAINER_TOKEN:-your-token-here}"
PORTAINER_ENDPOINT_ID="${PORTAINER_ENDPOINT_ID:-1}"  # Usually 1 for local Docker
ENVIRONMENT="feature-test"
STACK_NAME="words-feature-test"
IMAGE_TAG="feature-reduce-attempts"
PORT="8089"  # Using a different port for feature testing

# Stack definition with updated TOTAL_ATTEMPTS=6
STACK_CONTENT="version: \"3.8\"
services:
  words:
    image: ghcr.io/cache8063/words:${IMAGE_TAG}
    container_name: words-feature-test
    ports:
      - \"${PORT}:80\"
    environment:
      - NODE_ENV=development
      - PORT=80
      - LISTEN_ADDRESS=0.0.0.0
      - TOTAL_ATTEMPTS=6
    restart: unless-stopped
    healthcheck:
      test: [\"CMD\", \"wget\", \"--no-verbose\", \"--tries=1\", \"--spider\", \"http://localhost:80/health\"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - \"app=words\"
      - \"environment=feature-test\"
      - \"feature=reduce-attempts-to-six\""

echo "🚀 Deploying $STACK_NAME to Portainer..."
echo "📍 URL: $PORTAINER_URL"
echo "🔑 Token: ${PORTAINER_TOKEN:0:10}..." # Show first 10 chars for debugging
echo "🔧 Endpoint ID: $PORTAINER_ENDPOINT_ID"
echo "🎯 Feature: Reduced attempts from 7 to 6"
echo "🌐 Port: $PORT"

# First, let's test the connection
echo ""
echo "🔍 Testing Portainer connection..."
TEST_RESPONSE=$(curl -sk -H "X-API-Key: $PORTAINER_TOKEN" "$PORTAINER_URL/api/status" 2>&1)
TEST_EXIT=$?
echo "Connection test exit code: $TEST_EXIT"
echo "Status response: $TEST_RESPONSE"

# Check if token is set
if [ "$PORTAINER_TOKEN" = "your-token-here" ] || [ -z "$PORTAINER_TOKEN" ]; then
  echo "❌ Error: PORTAINER_TOKEN not set!"
  echo "Please run: export PORTAINER_TOKEN='your-actual-token'"
  exit 1
fi

# Check if stack exists (with -k flag to skip SSL verification)
STACK_ID=$(curl -sk -H "X-API-Key: $PORTAINER_TOKEN" \
  "$PORTAINER_URL/api/stacks" | \
  jq -r ".[] | select(.Name==\"$STACK_NAME\") | .Id")

if [ -n "$STACK_ID" ]; then
  echo "📝 Updating existing stack (ID: $STACK_ID)..."
  
  # Update existing stack (with -k flag to skip SSL verification)
  RESPONSE=$(curl -sk -X PUT \
    -H "X-API-Key: $PORTAINER_TOKEN" \
    -H "Content-Type: application/json" \
    "$PORTAINER_URL/api/stacks/$STACK_ID?endpointId=$PORTAINER_ENDPOINT_ID" \
    -d "{
      \"stackFileContent\": $(echo "$STACK_CONTENT" | jq -Rs .),
      \"prune\": true
    }")
else
  echo "✨ Creating new stack..."
  
  # Create new stack (with -k flag to skip SSL verification)
  echo "🔧 Creating stack with URL: $PORTAINER_URL/api/stacks?type=2&method=string&endpointId=$PORTAINER_ENDPOINT_ID"
  
  RESPONSE=$(curl -skv -X POST \
    -H "X-API-Key: $PORTAINER_TOKEN" \
    -H "Content-Type: application/json" \
    "$PORTAINER_URL/api/stacks?type=2&method=string&endpointId=$PORTAINER_ENDPOINT_ID" \
    -d "{
      \"name\": \"$STACK_NAME\",
      \"stackFileContent\": $(echo "$STACK_CONTENT" | jq -Rs .)
    }" 2>&1)
  
  # Debug: Show curl exit code
  CURL_EXIT=$?
  if [ $CURL_EXIT -ne 0 ]; then
    echo "❌ Curl failed with exit code: $CURL_EXIT"
  fi
fi

# Check if deployment was successful
if echo "$RESPONSE" | jq -e '.Id' > /dev/null 2>&1; then
  echo "✅ Stack deployed successfully!"
  echo "🌐 Access your feature test at: http://localhost:${PORT}"
  echo ""
  echo "📊 Stack details:"
  echo "$RESPONSE" | jq '{id: .Id, name: .Name, status: .Status}'
  echo ""
  echo "🧪 Test the following:"
  echo "  1. Game should show only 6 rows instead of 7"
  echo "  2. After 6 failed attempts, game ends and reveals word"
  echo "  3. No 7th guess should be possible"
else
  echo "❌ Deployment failed!"
  echo "Raw response:"
  echo "$RESPONSE"
  echo ""
  # Try to parse as JSON
  if echo "$RESPONSE" | jq '.' > /dev/null 2>&1; then
    echo "Parsed error:"
    echo "$RESPONSE" | jq '.'
  fi
  exit 1
fi

echo ""
echo "💡 Useful commands:"
echo "  View logs: docker logs words-feature-test"
echo "  Check status: docker ps | grep words-feature-test"
echo "  Restart: docker restart words-feature-test"
echo "  Remove: docker stack rm $STACK_NAME"