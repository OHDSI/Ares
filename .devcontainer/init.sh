#!/bin/sh
set -e
ENV_FILE=".devcontainer/.env"

if [ ! -f "$ENV_FILE" ]; then
  cp ".devcontainer/.env.example" "$ENV_FILE"
fi

current=$(grep '^POSTGRES_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)
if [ -z "$current" ] || [ "$current" = "change-me" ]; then
  PASSWORD=$(cat /dev/urandom | tr -dc 'a-f0-9' | head -c 32)
  grep -v '^POSTGRES_PASSWORD=' "$ENV_FILE" > "$ENV_FILE.tmp" && mv "$ENV_FILE.tmp" "$ENV_FILE"
  echo "POSTGRES_PASSWORD=$PASSWORD" >> "$ENV_FILE"
  echo "Generated POSTGRES_PASSWORD in $ENV_FILE"
fi
