# syntax=docker/dockerfile:1
# servers/api + servers/database-manager (마이그레이션 · 시드 포함) 이미지.
# 빌드 컨텍스트는 저장소 루트. web 소스는 같은 폴더의 Dockerfile.dockerignore 로 빠진다.

ARG NODE_IMAGE=node:24.14.0-bookworm-slim

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
RUN corepack enable
COPY . .
RUN yarn workspaces focus @fms/api @fms/database-manager
# api · database-manager 와 그 의존 libs 만 의존 순서대로 빌드한다.
RUN yarn workspaces foreach -Rt --from '@fms/api' --from '@fms/database-manager' run build

FROM builder AS prod-deps
RUN yarn workspaces focus @fms/api @fms/database-manager --production

FROM ${NODE_IMAGE}
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/servers/api/package.json ./servers/api/package.json
COPY --from=builder /app/servers/api/dist ./servers/api/dist
COPY --from=builder /app/servers/database-manager/package.json ./servers/database-manager/package.json
COPY --from=builder /app/servers/database-manager/dist ./servers/database-manager/dist
COPY dockers/scripts/run-migrations.sh ./dockers/scripts/run-migrations.sh
# 윈도우 체크아웃(CRLF)이면 sh 가 `set -e\r` 에서 실패하므로 CR 을 지운다.
RUN sed -i 's/\r$//' ./dockers/scripts/run-migrations.sh
WORKDIR /app/servers/api
EXPOSE 4000
CMD ["node", "dist/app.js"]
