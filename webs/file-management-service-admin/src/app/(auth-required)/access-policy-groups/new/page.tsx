import { AccessPolicyGroupEditor } from "@/components/domains/access-policy-groups/access-policy-group-editor";
import { requirePagePermission } from "@/utils/require-page-permission";

export default async function NewAccessPolicyGroupPage() {
  await requirePagePermission("policy.create");
  return <AccessPolicyGroupEditor group={null} />;
}
