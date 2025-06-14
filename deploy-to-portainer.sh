#!/bin/bash

# Portainer Stack Deployment Script

# Configuration - Update these values
PORTAINER_URL="${PORTAINER_URL:-https://ollama.cloudforest-basilisk.ts.net:9443}"
PORTAINER_TOKEN="${PORTAINER_TOKEN:-your-token-here}"
PORTAINER_ENDPOINT_ID="${PORTAINER_ENDPOINT_ID:-1}"  # Usually 1 for local Docker
ENVIRONMENT="${ENVIRONMENT:-dev}"
STACK_NAME="words-${ENVIRONMENT}"

# Set configuration based on environment
case $ENVIRONMENT in
  dev)
    IMAGE_TAG="develop"
    PORT="8086"
    ;;
  staging)
    IMAGE_TAG="staging"
    PORT="8087"
    ;;
  prod)
    IMAGE_TAG="latest"
    PORT="8088"
    ;;
esac

# Stack definition
STACK_CONTENT="version: \"3.8\"
services:
  words:
    image: ghcr.io/cache8063/words:${IMAGE_TAG}
    container_name: words-${ENVIRONMENT}
    ports:
      - \"${PORT}:80\"
    environment:
      - NODE_ENV=${ENVIRONMENT}
      - PORT=80
      - LISTEN_ADDRESS=0.0.0.0
      - TOTAL_ATTEMPTS=7
    restart: unless-stopped
    healthcheck:
      test: [\"CMD\", \"wget\", \"--no-verbose\", \"--tries=1\", \"--spider\", \"http://localhost:80/health\"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - \"app=words\"
      - \"environment=${ENVIRONMENT}\""

echo "🚀 Deploying $STACK_NAME to Portainer..."
echo "📍 URL: $PORTAINER_URL"
echo "🔑 Token: ${PORTAINER_TOKEN:0:10}..." # Show first 10 chars for debugging
echo "🔧 Endpoint ID: $PORTAINER_ENDPOINT_ID"

# First, let's test the connection
echo ""
echo "🔍 Testing Portainer connection..."
TEST_RESPONSE=$(curl -sk -H "X-API-Key: $PORTAINER_TOKEN" "$PORTAINER_URL/api/status" 2>&1)
TEST_EXIT=$?
echo "Connection test exit code: $TEST_EXIT"
echo "Status response: $TEST_RESPONSE"

# Also try to list endpoints
echo ""
echo "🔍 Listing endpoints..."
ENDPOINTS=$(curl -sk -H "X-API-Key: $PORTAINER_TOKEN" "$PORTAINER_URL/api/endpoints" 2>&1)
echo "Endpoints: $ENDPOINTS" | jq '.' 2>/dev/null || echo "Raw: $ENDPOINTS"

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
  echo "🌐 Access your app at: http://localhost:8086"
  echo ""
  echo "📊 Stack details:"
  echo "$RESPONSE" | jq '{id: .Id, name: .Name, status: .Status}'
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
echo "  View logs: docker logs words-game"
echo "  Check status: docker ps | grep words"
echo "  Restart: docker restart words-game"