import type { DataSourceOptions } from "typeorm";
import { AccessPolicyGroupEntity } from "../../entities/access-policy-group-entity/index.js";
import { AdminAccountEntity } from "../../entities/admin-account-entity/index.js";
import { AdminRefreshTokenEntity } from "../../entities/admin-refresh-token-entity/index.js";
import { DocumentEntity } from "../../entities/document-entity/index.js";
import { DocumentVersionEntity } from "../../entities/document-version-entity/index.js";
import { PermissionEntity } from "../../entities/permission-entity/index.js";
import { PermissionGroupEntity } from "../../entities/permission-group-entity/index.js";
import { ShareLinkDownloadLogEntity } from "../../entities/share-link-download-log-entity/index.js";
import { ShareLinkEntity } from "../../entities/share-link-entity/index.js";

export const ALL_ENTITIES = [
  AdminAccountEntity,
  AdminRefreshTokenEntity,
  PermissionEntity,
  PermissionGroupEntity,
  AccessPolicyGroupEntity,
  DocumentEntity,
  DocumentVersionEntity,
  ShareLinkEntity,
  ShareLinkDownloadLogEntity,
];

export type DatabaseConnectionEnv = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

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
