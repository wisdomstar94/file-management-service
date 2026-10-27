import type { ACCESS_POLICY_GROUP_LIST_API } from "@fms/api-schemas/schemas/access-policy-group-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";

export function toAccessPolicyGroupSummaryResponse(
  group: AccessPolicyGroupEntity,
): ResBody<typeof ACCESS_POLICY_GROUP_LIST_API>["data"][number] {
  return {
    id: group.id,
    name: group.name,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}
