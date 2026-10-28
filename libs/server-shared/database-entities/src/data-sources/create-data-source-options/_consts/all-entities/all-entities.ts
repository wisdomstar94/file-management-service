import { AccessPolicyGroupEntity } from "../../../../entities/access-policy-group-entity/index.js";
import { AdminAccountEntity } from "../../../../entities/admin-account-entity/index.js";
import { AdminRefreshTokenEntity } from "../../../../entities/admin-refresh-token-entity/index.js";
import { DocumentEntity } from "../../../../entities/document-entity/index.js";
import { DocumentVersionEntity } from "../../../../entities/document-version-entity/index.js";
import { PermissionEntity } from "../../../../entities/permission-entity/index.js";
import { PermissionGroupEntity } from "../../../../entities/permission-group-entity/index.js";
import { ShareLinkDownloadLogEntity } from "../../../../entities/share-link-download-log-entity/index.js";
import { ShareLinkEntity } from "../../../../entities/share-link-entity/index.js";

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
