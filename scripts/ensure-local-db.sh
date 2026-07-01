#!/bin/sh
# 로컬 dev 전 Postgres/Redis/MinIO가 떠 있는지 확인하고, 없으면 기동합니다.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! docker info >/dev/null 2>&1; then
  echo ""
  echo "Docker가 실행 중이 아닙니다."
  echo "Docker Desktop을 켠 뒤 다시 npm run dev 를 실행하세요."
  echo ""
  exit 1
fi

postgres_ready() {
  docker compose exec -T postgres pg_isready -U postgres -d heavyjungle >/dev/null 2>&1
}

wait_for_postgres() {
  i=1
  while [ "$i" -le 30 ]; do
    if postgres_ready; then
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done
  return 1
}

started=0

if ! postgres_ready; then
  echo "==> Postgres가 꺼져 있어 로컬 DB 서비스를 시작합니다..."
  docker compose up -d postgres redis minio
  started=1
fi

if ! wait_for_postgres; then
  echo "PostgreSQL이 준비되지 않았습니다. docker compose logs postgres 를 확인하세요."
  exit 1
fi

if [ "$started" -eq 1 ]; then
  docker compose up minio-init >/dev/null 2>&1 || true
  echo "==> DB 마이그레이션 적용 중..."
  npm run db:migrate --silent
  echo "==> 로컬 DB 준비 완료"
fi
