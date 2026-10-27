import type { ADMIN_ACCOUNT_DETAIL_API } from "@fms/api-schemas/schemas/admin-account-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";

export function toAdminAccountResponse(account: AdminAccountEntity): ResBody<typeof ADMIN_ACCOUNT_DETAIL_API>["data"] {
  return {
    id: account.id,
    loginId: account.loginId,
    nickname: account.nickname,
    memo: account.memo,
    permissionGroup: { id: account.permissionGroupId, name: account.permissionGroup?.name ?? "" },
    accessPolicyGroup: { id: account.accessPolicyGroupId, name: account.accessPolicyGroup?.name ?? "" },
    lastAccessedAt: account.lastAccessedAt?.toISOString() ?? null,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}
