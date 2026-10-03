import type { AdminAccountResponse } from "@fms/api-schemas/responses/admin-account-responses";
import type { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";

export function toAdminAccountResponse(account: AdminAccountEntity): AdminAccountResponse {
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
