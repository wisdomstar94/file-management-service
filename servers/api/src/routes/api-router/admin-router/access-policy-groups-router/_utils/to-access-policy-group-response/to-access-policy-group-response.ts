import type { AccessPolicyGroupSummaryResponse } from "@fms/api-schemas/responses/access-policy-group-responses";
import type { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";

export function toAccessPolicyGroupSummaryResponse(group: AccessPolicyGroupEntity): AccessPolicyGroupSummaryResponse {
  return {
    id: group.id,
    name: group.name,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}
