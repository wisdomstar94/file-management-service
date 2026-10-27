import { PERMISSION_LIST_API } from "@fms/api-schemas/schemas/permission-api-schemas";
import { PermissionsScreen } from "@/components/domains/permissions/permissions-screen";
import { requirePagePermission } from "@/utils/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

export default async function PermissionsPage() {
  await requirePagePermission("perm.access");
  const permissions = await fetchServerWrapper(PERMISSION_LIST_API, {});
  return <PermissionsScreen permissions={permissions.data} />;
}
