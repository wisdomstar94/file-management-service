import type {
  PERMISSION_GROUP_DETAIL_API,
  PERMISSION_GROUP_LIST_API,
} from "@fms/api-schemas/schemas/permission-group-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { PermissionGroupEntity } from "@fms/database-entities/entities/permission-group-entity";
import { toPermissionResponse } from "../../../_utils/to-permission-response/index.js";

export function toPermissionGroupSummaryResponse(
  group: PermissionGroupEntity,
  permissionCount: number,
): ResBody<typeof PERMISSION_GROUP_LIST_API>["data"][number] {
  return {
    id: group.id,
    name: group.name,
    permissionCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}

export function toPermissionGroupDetailResponse(
  group: PermissionGroupEntity,
): ResBody<typeof PERMISSION_GROUP_DETAIL_API>["data"] {
  const permissions = group.permissions ?? [];
  return {
    ...toPermissionGroupSummaryResponse(group, permissions.length),
    permissions: permissions.map(toPermissionResponse),
  };
}
