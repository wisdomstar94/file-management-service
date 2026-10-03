import type { PermissionResponse } from "@fms/api-schemas/responses/permission-responses";
import type { PermissionEntity } from "@fms/database-entities/entities/permission-entity";

export function toPermissionResponse(permission: PermissionEntity): PermissionResponse {
  return {
    id: permission.id,
    category: permission.category,
    name: permission.name,
    code: permission.code,
    description: permission.description,
    createdAt: permission.createdAt.toISOString(),
    updatedAt: permission.updatedAt.toISOString(),
  };
}
