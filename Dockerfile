FROM docker.io/library/node:18.14.1-alpine@sha256:045b1a1c90bdfd8fcaad0769922aa16c401e31867d8bf5833365b0874884bbae as builder
RUN apk add --no-cache python3 py3-pip make g++

WORKDIR /code
COPY ./ /code/

RUN npm install
RUN npm run build

FROM nginx as webserver
COPY --from=builder /code/dist /usr/share/nginx/html/ares