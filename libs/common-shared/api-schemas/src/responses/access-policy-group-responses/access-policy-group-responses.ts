import type { AccessPolicyNode } from "@fms/common-utils/access-policies/access-policy-node";

export type AccessPolicyGroupSummaryResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type AccessPolicyGroupDetailResponse = AccessPolicyGroupSummaryResponse & {
  ruleTree: AccessPolicyNode | null;
  usedAccountCount: number;
  usedShareLinkCount: number;
};
