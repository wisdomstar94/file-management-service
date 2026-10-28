# syntax=docker/dockerfile:1
# 격리된 e2e 테스트 러너. 서버 · web 을 모두 빌드한 저장소 전체가 필요해 루트 .dockerignore 를 쓴다.
#   e2e-servers · e2e-webs

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

FROM builder AS e2e-servers
CMD ["sh", "-c", "yarn workspace @fms/database-manager e2e && yarn workspace @fms/api e2e"]

FROM mcr.microsoft.com/playwright:v1.63.0-noble AS e2e-webs
WORKDIR /app
COPY --from=builder /app /app
CMD ["sh", "-c", "cd /app/webs/file-management-service-admin && npx playwright test && cd /app/webs/file-management-service-user && npx playwright test"]
