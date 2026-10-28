# 작업 규칙

## DB 마이그레이션

- DB 마이그레이션 파일은 `servers/database-manager/src/migrations` 에 있고, 반드시 TypeORM CLI 로 만듭니다.
  - 엔티티 변경을 반영할 때: `yarn workspace @fms/database-manager migration:generate src/migrations/<이름>`
  - 데이터 이전 · 직접 쓰는 SQL 처럼 손으로 작성할 때: `yarn workspace @fms/database-manager migration:create src/migrations/<이름>` 로 빈 파일을 만든 뒤 내용을 채웁니다.
- 파일명 · 클래스명 · `name` 의 timestamp 를 직접 짓거나 고치지 않습니다. 이전 파일 번호에 일정 값을 더하는 식으로 만들면 언제 만든 DB 마이그레이션인지 알 수 없게 됩니다.
- 이미 어떤 DB 에든 적용된 DB 마이그레이션은 이름을 바꾸지 않습니다. `migrations` 테이블에 기록된 이름과 달라져 다시 실행됩니다.
- `yarn lint:check` 가 `scripts/check-migrations.mjs` 로 위 규칙을 검사합니다.
