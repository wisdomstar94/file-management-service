import type { PERMISSION_GROUP_DETAIL_API } from "@fms/api-schemas/schemas/permission-group-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { PermissionGroupEntity } from "@fms/database-entities/entities/permission-group-entity";
import { toPermissionResponse } from "../../../../../_utils/to-permission-response/index.js";
import { toPermissionGroupSummaryResponse } from "../to-permission-group-summary-response/index.js";

export function toPermissionGroupDetailResponse(
  group: PermissionGroupEntity,
): ResBody<typeof PERMISSION_GROUP_DETAIL_API>["data"] {
  const permissions = group.permissions ?? [];
  return {
    ...toPermissionGroupSummaryResponse(group, permissions.length),
    permissions: permissions.map(toPermissionResponse),
  };
}
