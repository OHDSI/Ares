#!/bin/sh
set -e

pnpm install --frozen-lockfile

mkdir -p frontend/public/data
unzip -o sample/frontend/data.zip -d frontend/public/data/

PGPASSWORD=$DATABASE_PASSWORD psql \
  -h "$POSTGRES_HOST" \
  -p "$PGPORT" \
  -U "$DATABASE_USERNAME" \
  -d "$DATABASE_NAME" \
  -f sample/backend/seed.sql
