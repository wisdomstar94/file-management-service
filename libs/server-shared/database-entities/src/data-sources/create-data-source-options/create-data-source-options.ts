import type { DataSourceOptions } from "typeorm";
import { ALL_ENTITIES } from "./_consts/all-entities/index.js";
import type { DatabaseConnectionEnv } from "./_types/database-connection-env/index.js";

/**
 * 모든 엔티티를 등록한 PostgreSQL DataSource 옵션을 만듭니다.
 * 스키마 변경은 마이그레이션으로만 반영하므로 `synchronize` 는 항상 `false` 입니다.
 */
export function createDataSourceOptions(
  props: DatabaseConnectionEnv & { migrations?: string[]; logging?: boolean },
): DataSourceOptions {
  const { migrations = [], logging = false, ...connection } = props;

  return {
    type: "postgres",
    uuidExtension: "pgcrypto",
    ...connection,
    entities: ALL_ENTITIES,
    migrations,
    migrationsTableName: "migrations",
    synchronize: false,
    logging,
  };
}
