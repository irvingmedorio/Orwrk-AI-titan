#!/usr/bin/env bash
set -euo pipefail

echo "Stopping services..."
docker compose down

echo "Removing old volumes..."
docker volume prune -f

echo "Rebuilding containers..."
docker compose build --pull --no-cache

echo "Reinstalling crush inside backend container..."
docker compose run --rm backend-api bash -c \
"curl -sSL https://raw.githubusercontent.com/charmbracelet/crush/main/install.sh | sh"

echo "Starting services..."
docker compose up -d
