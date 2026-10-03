import type { AccessPolicyGroupDetailResponse } from "@fms/api-schemas/responses/access-policy-group-responses";
import { AccessPolicyGroupEditor } from "@/components/domains/access-policy-groups/access-policy-group-editor";
import { requirePagePermission } from "@/utils/require-page-permission";
import { serverApiFetch } from "@/utils/server-api-fetch";

export default async function AccessPolicyGroupDetailPage(props: PageProps<"/access-policy-groups/[groupId]">) {
  await requirePagePermission("policy.access");
  const { groupId } = await props.params;
  const group = await serverApiFetch<AccessPolicyGroupDetailResponse>(
    `/api/admin/access-policy-groups/${encodeURIComponent(groupId)}`,
  );
  return <AccessPolicyGroupEditor group={group} />;
}
