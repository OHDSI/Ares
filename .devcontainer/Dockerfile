FROM mcr.microsoft.com/devcontainers/javascript-node:22-bullseye
RUN apt-get update && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate
