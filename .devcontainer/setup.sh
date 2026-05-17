#!/bin/sh
set -e

pnpm install --frozen-lockfile

unzip -oq sample/frontend/data.zip -d frontend/public/

PGPASSWORD=$DATABASE_PASSWORD PGOPTIONS='--client-min-messages=warning' psql \
  -h "$POSTGRES_HOST" \
  -p "$PGPORT" \
  -U "$DATABASE_USERNAME" \
  -d "$DATABASE_NAME" \
  -f sample/backend/seed.sql \
  -q
