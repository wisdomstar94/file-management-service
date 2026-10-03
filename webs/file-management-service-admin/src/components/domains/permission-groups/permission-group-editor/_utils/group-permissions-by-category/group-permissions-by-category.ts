import type { PermissionResponse } from "@fms/api-schemas/responses/permission-responses";

export function groupPermissionsByCategory(permissions: PermissionResponse[]) {
  const sections = new Map<string, PermissionResponse[]>();
  for (const permission of permissions) {
    sections.set(permission.category, [...(sections.get(permission.category) ?? []), permission]);
  }
  return [...sections.entries()].map(([category, items]) => ({ category, items }));
}
