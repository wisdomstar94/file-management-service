import type { PermissionGroupDetailResponse } from "@fms/api-schemas/responses/permission-group-responses";
import type { PermissionResponse } from "@fms/api-schemas/responses/permission-responses";
import { PermissionGroupEditor } from "@/components/domains/permission-groups/permission-group-editor";
import { requirePagePermission } from "@/utils/require-page-permission";
import { serverApiFetch } from "@/utils/server-api-fetch";

export default async function PermissionGroupDetailPage(props: PageProps<"/permissions/groups/[groupId]">) {
  await requirePagePermission("perm.group.access");
  const { groupId } = await props.params;
  const [group, permissions] = await Promise.all([
    serverApiFetch<PermissionGroupDetailResponse>(`/api/admin/permission-groups/${encodeURIComponent(groupId)}`),
    serverApiFetch<PermissionResponse[]>("/api/admin/permission-groups/assignable-permissions"),
  ]);
  return <PermissionGroupEditor group={group} permissions={permissions} />;
}
