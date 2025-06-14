#!/bin/bash

echo "🔄 Restarting Words game with latest image..."

# Pull the latest image
echo "📥 Pulling latest image..."
docker pull ghcr.io/cache8063/words:develop

# Get container name/id
CONTAINER=$(docker ps -q -f "ancestor=ghcr.io/cache8063/words:develop")

if [ -n "$CONTAINER" ]; then
    echo "🛑 Stopping container: $CONTAINER"
    docker stop $CONTAINER
    docker rm $CONTAINER
fi

# Or if using docker-compose
if [ -f "docker-compose.production.yml" ]; then
    echo "🔄 Restarting with docker-compose..."
    docker-compose -f docker-compose.production.yml pull
    docker-compose -f docker-compose.production.yml down
    docker-compose -f docker-compose.production.yml up -d
else
    echo "🚀 Starting new container..."
    docker run -d --name words-game -p 8086:80 ghcr.io/cache8063/words:develop
fi

echo "✅ Done! Clear your browser cache and reload."