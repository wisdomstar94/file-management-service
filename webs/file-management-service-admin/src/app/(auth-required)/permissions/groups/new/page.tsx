import type { PermissionResponse } from "@fms/api-schemas/responses/permission-responses";
import { PermissionGroupEditor } from "@/components/domains/permission-groups/permission-group-editor";
import { requirePagePermission } from "@/utils/require-page-permission";
import { serverApiFetch } from "@/utils/server-api-fetch";

export default async function NewPermissionGroupPage() {
  await requirePagePermission("perm.group.create");
  const permissions = await serverApiFetch<PermissionResponse[]>("/api/admin/permission-groups/assignable-permissions");
  return <PermissionGroupEditor group={null} permissions={permissions} />;
}
