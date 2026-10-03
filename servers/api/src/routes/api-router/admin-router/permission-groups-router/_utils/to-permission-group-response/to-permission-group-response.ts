import type {
  PermissionGroupDetailResponse,
  PermissionGroupSummaryResponse,
} from "@fms/api-schemas/responses/permission-group-responses";
import type { PermissionGroupEntity } from "@fms/database-entities/entities/permission-group-entity";
import { toPermissionResponse } from "../../../_utils/to-permission-response/index.js";

export function toPermissionGroupSummaryResponse(
  group: PermissionGroupEntity,
  permissionCount: number,
): PermissionGroupSummaryResponse {
  return {
    id: group.id,
    name: group.name,
    permissionCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}

export function toPermissionGroupDetailResponse(group: PermissionGroupEntity): PermissionGroupDetailResponse {
  const permissions = group.permissions ?? [];
  return {
    ...toPermissionGroupSummaryResponse(group, permissions.length),
    permissions: permissions.map(toPermissionResponse),
  };
}
