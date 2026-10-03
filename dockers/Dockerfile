# syntax=docker/dockerfile:1
# 한 Dockerfile 안에 빌드 대상(target)을 나눠 둔다. builder 를 한 번만 정의하기 위함.
#   api        : servers/api + servers/database-manager (마이그레이션 · 시드 포함)
#   admin-web  : webs/file-management-service-admin (Next standalone)
#   user-web   : webs/file-management-service-user (Next standalone)
#   e2e-servers · e2e-webs : 격리된 e2e 테스트 러너

ARG NODE_IMAGE=node:24.14.0-bookworm-slim

FROM ${NODE_IMAGE} AS builder
WORKDIR /app
RUN corepack enable
COPY . .
RUN yarn install --immutable
RUN yarn libs:build \
  && yarn workspace @fms/database-manager build \
  && yarn workspace @fms/api build \
  && yarn workspace @fms/admin-web build \
  && yarn workspace @fms/user-web build

FROM builder AS server-prod-deps
RUN yarn workspaces focus @fms/api @fms/database-manager --production

FROM ${NODE_IMAGE} AS api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=server-prod-deps /app/node_modules ./node_modules
COPY --from=server-prod-deps /app/package.json ./package.json
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

FROM ${NODE_IMAGE} AS admin-web
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
COPY --from=builder /app/webs/file-management-service-admin/.next/standalone ./
COPY --from=builder /app/webs/file-management-service-admin/.next/static ./webs/file-management-service-admin/.next/static
EXPOSE 3000
CMD ["node", "webs/file-management-service-admin/server.js"]

FROM ${NODE_IMAGE} AS user-web
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3001
COPY --from=builder /app/webs/file-management-service-user/.next/standalone ./
COPY --from=builder /app/webs/file-management-service-user/.next/static ./webs/file-management-service-user/.next/static
EXPOSE 3001
CMD ["node", "webs/file-management-service-user/server.js"]

FROM builder AS e2e-servers
CMD ["sh", "-c", "yarn workspace @fms/database-manager e2e && yarn workspace @fms/api e2e"]

FROM mcr.microsoft.com/playwright:v1.63.0-noble AS e2e-webs
WORKDIR /app
COPY --from=builder /app /app
CMD ["sh", "-c", "cd /app/webs/file-management-service-admin && npx playwright test && cd /app/webs/file-management-service-user && npx playwright test"]
