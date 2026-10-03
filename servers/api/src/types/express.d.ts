import type { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";
import type { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import type { PermissionGroupEntity } from "@fms/database-entities/entities/permission-group-entity";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        account: AdminAccountEntity;
        permissionGroup: PermissionGroupEntity;
        accessPolicyGroup: AccessPolicyGroupEntity;
        permissionCodes: Set<string>;
      };
    }
  }
}
