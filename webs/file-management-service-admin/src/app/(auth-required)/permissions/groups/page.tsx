import type { PermissionGroupSummaryResponse } from "@fms/api-schemas/responses/permission-group-responses";
import type { PermissionResponse } from "@fms/api-schemas/responses/permission-responses";
import { PermissionGroupsScreen } from "@/components/domains/permission-groups/permission-groups-screen";
import { requirePagePermission } from "@/utils/require-page-permission";
import { serverApiFetch } from "@/utils/server-api-fetch";

export default async function PermissionGroupsPage() {
  await requirePagePermission("perm.group.access");
  const [groups, permissions] = await Promise.all([
    serverApiFetch<PermissionGroupSummaryResponse[]>("/api/admin/permission-groups"),
    serverApiFetch<PermissionResponse[]>("/api/admin/permission-groups/assignable-permissions"),
  ]);
  return <PermissionGroupsScreen groups={groups} permissionTotal={permissions.length} />;
}
