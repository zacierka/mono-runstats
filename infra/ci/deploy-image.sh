#!/usr/bin/env bash

set -e

# ===== CONFIG =====
REGISTRY="${REGISTRY_URL:-192.168.1.33:5000}"
TAG="${TAG:-latest}"

# ===== HELP =====
if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh [all|bot|pg|strava]"
  exit 1
fi

build_bot() {
  IMG=strava-bot
  echo "🔨 Building bot..."
  docker build -f infra/images/Dockerfile.discord -t $IMG .

  echo "🏷 Tagging..."
  docker tag $IMG "$REGISTRY/$IMG:$TAG"

  echo "🚀 Pushing... $REGISTRY/$IMG:$TAG"
  docker push "$REGISTRY/$IMG:$TAG"
}

build_strava() {
  IMG=strava-web
  echo "🔨 Building webstrava..."
  docker build -f infra/images/Dockerfile.webstrava -t $IMG .

  echo "🏷 Tagging..."
  docker tag $IMG "$REGISTRY/$IMG:$TAG"

  echo "🚀 Pushing... $REGISTRY/$IMG:$TAG"
  docker push "$REGISTRY/$IMG:$TAG"
}

build_pg() {
  IMG=strava-pg
  echo "🔨 Building postgres..."
  docker build -f infra/images/Dockerfile.postgres -t $IMG .

  echo "🏷 Tagging..."
  docker tag $IMG "$REGISTRY/$IMG:$TAG"

  echo "🚀 Pushing... $REGISTRY/$IMG:$TAG"
  docker push "$REGISTRY/$IMG:$TAG"
}

# ===== MAIN SWITCH =====

case "$1" in
  bot)
    build_bot
    ;;
  web)
    build_strava
    ;;
  pg)
    build_pg
    ;;
  all)
    build_bot
    build_strava
    build_pg
    ;;
  *)
    echo "❌ Invalid option: $1"
    echo "Usage: ./deploy.sh [all|bot|pg|web]"
    exit 1
    ;;
esac

echo "✅ Done! Built $1"