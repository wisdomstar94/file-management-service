import type { AccessPolicyGroupSummaryResponse } from "@fms/api-schemas/responses/access-policy-group-responses";
import { AccessPolicyGroupsScreen } from "@/components/domains/access-policy-groups/access-policy-groups-screen";
import { requirePagePermission } from "@/utils/require-page-permission";
import { serverApiFetch } from "@/utils/server-api-fetch";

export default async function AccessPolicyGroupsPage() {
  await requirePagePermission("policy.access");
  const groups = await serverApiFetch<AccessPolicyGroupSummaryResponse[]>("/api/admin/access-policy-groups");
  return <AccessPolicyGroupsScreen groups={groups} />;
}
