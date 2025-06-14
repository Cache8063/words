#!/bin/bash

# Cron job to update Portainer stack every minute
# Add to crontab: * * * * * /path/to/portainer-update-cron.sh

PORTAINER_URL="https://ollama.cloudforest-basilisk.ts.net:9443"
PORTAINER_TOKEN="${PORTAINER_TOKEN}"
CONTAINER_NAME="words-game"

# Get container info
CONTAINER_INFO=$(curl -sk -H "X-API-Key: $PORTAINER_TOKEN" \
  "$PORTAINER_URL/api/endpoints/1/docker/containers/json?filters={\"name\":[\"$CONTAINER_NAME\"]}" | \
  jq -r '.[0]')

if [ "$CONTAINER_INFO" != "null" ]; then
  CONTAINER_ID=$(echo "$CONTAINER_INFO" | jq -r '.Id')
  IMAGE=$(echo "$CONTAINER_INFO" | jq -r '.Image')
  
  # Recreate with pull
  curl -sk -X POST \
    -H "X-API-Key: $PORTAINER_TOKEN" \
    "$PORTAINER_URL/api/endpoints/1/docker/containers/${CONTAINER_ID}/recreate?pullImage=true"
fi