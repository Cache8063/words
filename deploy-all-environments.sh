#!/bin/bash

# Deploy all environments to Portainer

PORTAINER_URL="${PORTAINER_URL:-https://ollama.cloudforest-basilisk.ts.net:9443}"
PORTAINER_TOKEN="${PORTAINER_TOKEN}"
PORTAINER_ENDPOINT_ID="${PORTAINER_ENDPOINT_ID:-1}"

if [ -z "$PORTAINER_TOKEN" ]; then
  echo "❌ Error: PORTAINER_TOKEN not set!"
  echo "Please run: export PORTAINER_TOKEN='your-actual-token'"
  exit 1
fi

echo "🚀 Deploying Words Game - All Environments"
echo "==========================================="

# Function to deploy a stack
deploy_stack() {
  local ENV=$1
  local PORT=$2
  local IMAGE_TAG=$3
  local REPLICAS=${4:-1}
  
  STACK_NAME="words-${ENV}"
  
  echo ""
  echo "📦 Deploying ${STACK_NAME}..."
  
  # Stack content
  STACK_CONTENT="version: \"3.8\"
services:
  words:
    image: ghcr.io/cache8063/words:${IMAGE_TAG}
    ports:
      - \"${PORT}:80\"
    environment:
      - NODE_ENV=${ENV}
      - PORT=80
      - LISTEN_ADDRESS=0.0.0.0
      - TOTAL_ATTEMPTS=7
    deploy:
      replicas: ${REPLICAS}
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
    healthcheck:
      test: [\"CMD\", \"wget\", \"--no-verbose\", \"--tries=1\", \"--spider\", \"http://localhost:80/health\"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - \"app=words\"
      - \"environment=${ENV}\""
  
  # Check if stack exists
  STACK_ID=$(curl -sk -H "X-API-Key: $PORTAINER_TOKEN" \
    "$PORTAINER_URL/api/stacks" | \
    jq -r ".[] | select(.Name==\"$STACK_NAME\") | .Id")
  
  if [ -n "$STACK_ID" ]; then
    echo "  📝 Updating existing stack (ID: $STACK_ID)..."
    RESPONSE=$(curl -sk -X PUT \
      -H "X-API-Key: $PORTAINER_TOKEN" \
      -H "Content-Type: application/json" \
      "$PORTAINER_URL/api/stacks/$STACK_ID?endpointId=$PORTAINER_ENDPOINT_ID" \
      -d "{
        \"stackFileContent\": $(echo "$STACK_CONTENT" | jq -Rs .),
        \"prune\": true
      }")
  else
    echo "  ✨ Creating new stack..."
    RESPONSE=$(curl -sk -X POST \
      -H "X-API-Key: $PORTAINER_TOKEN" \
      -H "Content-Type: application/json" \
      "$PORTAINER_URL/api/stacks?type=2&method=string&endpointId=$PORTAINER_ENDPOINT_ID" \
      -d "{
        \"name\": \"$STACK_NAME\",
        \"stackFileContent\": $(echo "$STACK_CONTENT" | jq -Rs .)
      }")
  fi
  
  if echo "$RESPONSE" | jq -e '.Id' > /dev/null 2>&1; then
    echo "  ✅ ${STACK_NAME} deployed successfully!"
  else
    echo "  ❌ Failed to deploy ${STACK_NAME}"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  fi
}

# Deploy all environments
deploy_stack "dev" "8086" "develop" "1"
deploy_stack "staging" "8087" "staging" "1"
deploy_stack "production" "8088" "latest" "2"

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "🌐 Access your environments:"
echo "  Development: http://ollama.cloudforest-basilisk.ts.net:8086"
echo "  Staging:     http://ollama.cloudforest-basilisk.ts.net:8087"
echo "  Production:  http://ollama.cloudforest-basilisk.ts.net:8088"
echo ""
echo "📊 Your existing wordsv3 stack remains untouched."
echo "   You can migrate users when ready by updating DNS/proxy."
echo ""
echo "💡 Tips:"
echo "  - Each environment auto-updates from its respective branch"
echo "  - Production runs 2 replicas for high availability"
echo "  - Portainer will check for updates every 60 seconds"