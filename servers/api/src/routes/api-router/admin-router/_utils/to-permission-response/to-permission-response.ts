import type { PERMISSION_DETAIL_API } from "@fms/api-schemas/schemas/permission-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { PermissionEntity } from "@fms/database-entities/entities/permission-entity";

export function toPermissionResponse(permission: PermissionEntity): ResBody<typeof PERMISSION_DETAIL_API>["data"] {
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
