import type { PermissionListResponse } from "@fms/api-schemas/responses/permission-responses";
import { PermissionsScreen } from "@/components/domains/permissions/permissions-screen";
import { requirePagePermission } from "@/utils/require-page-permission";
import { serverApiFetch } from "@/utils/server-api-fetch";

export default async function PermissionsPage() {
  await requirePagePermission("perm.access");
  const permissions = await serverApiFetch<PermissionListResponse>("/api/admin/permissions");
  return <PermissionsScreen permissions={permissions} />;
}
