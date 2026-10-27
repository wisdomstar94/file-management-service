import { ACCESS_POLICY_GROUP_LIST_API } from "@fms/api-schemas/schemas/access-policy-group-api-schemas";
import { AccessPolicyGroupsScreen } from "@/components/domains/access-policy-groups/access-policy-groups-screen";
import { requirePagePermission } from "@/utils/require-page-permission";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

export default async function AccessPolicyGroupsPage() {
  await requirePagePermission("policy.access");
  const groups = await fetchServerWrapper(ACCESS_POLICY_GROUP_LIST_API, {});
  return <AccessPolicyGroupsScreen groups={groups.data} />;
}
