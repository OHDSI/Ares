FROM docker.io/library/node:22.22.3-alpine@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920 as builder
RUN apk add --no-cache python3 py3-pip make g++ && corepack enable && corepack prepare pnpm@11.1.2 --activate

WORKDIR /code
COPY ./ /code/

RUN pnpm install
RUN pnpm run build

FROM docker.io/library/nginx:1.30.1@sha256:842a3f99afd73859b5c647f8be6f0000849be286674e30d9dbcf7a6902a69487 as webserver
COPY --from=builder /code/dist /usr/share/nginx/html/ares