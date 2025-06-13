#!/bin/bash

# Words Game Deployment Script

echo "🚀 Deploying Words Game..."

# Set environment
ENV=${1:-production}
echo "Environment: $ENV"

# Choose compose file based on environment
case $ENV in
  dev|development)
    COMPOSE_FILE="docker-compose.dev.yml"
    IMAGE_TAG="develop"
    ;;
  staging)
    COMPOSE_FILE="docker-compose.staging.yml"
    IMAGE_TAG="staging"
    ;;
  prod|production)
    COMPOSE_FILE="docker-compose.production.yml"
    IMAGE_TAG="latest"
    ;;
  *)
    echo "❌ Unknown environment: $ENV"
    echo "Usage: ./deploy.sh [dev|staging|prod]"
    exit 1
    ;;
esac

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "❌ Compose file not found: $COMPOSE_FILE"
  exit 1
fi

echo "📥 Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull

echo "🔄 Stopping old containers..."
docker-compose -f $COMPOSE_FILE down

echo "🚀 Starting new containers..."
docker-compose -f $COMPOSE_FILE up -d

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment complete!"
echo ""
echo "📊 Container status:"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "📝 Logs (last 20 lines):"
docker-compose -f $COMPOSE_FILE logs --tail=20 words

echo ""
echo "🌐 Access the game at:"
echo "   http://localhost:8086"
echo ""
echo "💡 Tips:"
echo "   - View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   - Stop: docker-compose -f $COMPOSE_FILE down"
echo "   - Restart: docker-compose -f $COMPOSE_FILE restart"