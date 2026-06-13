#!/usr/bin/env bash

set -e

if [ -z "$1" ]; then
  echo "Usage: ./build-local.sh [all|bot|pg|web]"
  exit 1
fi

build_bot() {
  echo "🔨 Building bot..."
  docker build -f infra/images/Dockerfile.discord -t strava-bot .
}

build_strava() {
  echo "🔨 Building webstrava..."
  docker build -f infra/images/Dockerfile.webstrava -t strava-web .
}

build_pg() {
  echo "🔨 Building postgres..."
  docker build -f infra/images/Dockerfile.postgres -t strava-pg .
}

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
    echo "Usage: ./build-local.sh [all|bot|pg|web]"
    exit 1
    ;;
esac

echo "✅ Done! Built $1"
