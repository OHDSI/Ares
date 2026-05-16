#!/bin/sh
set -e

pnpm install --frozen-lockfile

mkdir -p frontend/public/data
unzip -oq sample/frontend/data.zip -d frontend/public/

until pg_isready -h "$POSTGRES_HOST" -p "$PGPORT" -U "$DATABASE_USERNAME"; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

PGPASSWORD=$DATABASE_PASSWORD PGOPTIONS='--client-min-messages=warning' psql \
  -h "$POSTGRES_HOST" \
  -p "$PGPORT" \
  -U "$DATABASE_USERNAME" \
  -d "$DATABASE_NAME" \
  -f sample/backend/seed.sql \
  -q
