#!/bin/sh
# NAS production deploy — run from /volume1/docker/heavyjungle
# Usage: ./scripts/nas-deploy.sh

set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="docker-compose.nas.yml"
COMPOSE_PROFILE="${NAS_COMPOSE_PROFILE:-cloudflare}"
BRANCH="${NAS_DEPLOY_BRANCH:-main}"
HEALTH_URL="${NAS_HEALTH_URL:-http://localhost:3000/api/health}"

echo "==> Deploying heavyjungle from $ROOT"

echo "==> git pull origin $BRANCH"
git pull origin "$BRANCH"

echo "==> docker compose up --build"
sudo docker compose -f "$COMPOSE_FILE" --profile "$COMPOSE_PROFILE" up -d --build

echo "==> DB migrations"
sh "$ROOT/scripts/nas-migrate.sh"

echo "==> Waiting for app..."
i=1
while [ "$i" -le 30 ]; do
  if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
    break
  fi
  sleep 2
  i=$((i + 1))
done

echo "==> Health check: $HEALTH_URL"
if curl -sf "$HEALTH_URL"; then
  echo ""
  echo "==> Deploy complete."
else
  echo "==> Health check failed" >&2
  sudo docker compose -f "$COMPOSE_FILE" logs --tail=80 app
  exit 1
fi
