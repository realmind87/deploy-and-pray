#!/bin/sh
# NAS DB 마이그레이션 — /volume1/docker/heavyjungle 에서 실행
# Usage: ./scripts/nas-migrate.sh

set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="${NAS_COMPOSE_FILE:-docker-compose.nas.yml}"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

echo "==> Running Drizzle migrations (postgres must be up)"
sudo docker compose -f "$COMPOSE_FILE" --profile migrate run --rm migrate

echo "==> Verifying posts table"
if ! sudo docker exec heavyjungle-postgres \
  psql -U postgres -d heavyjungle -tAc "SELECT to_regclass('public.posts') IS NOT NULL" \
  | grep -q true; then
  echo "==> Migration finished but public.posts is missing" >&2
  exit 1
fi

echo "==> Migrations complete."
