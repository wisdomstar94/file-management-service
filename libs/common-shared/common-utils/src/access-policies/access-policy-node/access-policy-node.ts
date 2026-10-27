/** 접근 정책 조건 트리의 최대 중첩 단계 */
export const ACCESS_POLICY_TREE_MAX_DEPTH = 5;

export type AccessPolicyIpMode = "ALLOW_ALL_EXCEPT" | "DENY_ALL_EXCEPT";

export type AccessPolicyHeaderMatchType = "EQUALS" | "CONTAINS" | "REGEX" | "EXISTS";

export type AccessPolicyGroupNode = { type: "GROUP"; operator: "AND" | "OR"; children: AccessPolicyNode[] };

export type AccessPolicyIpNode = { type: "IP"; mode: AccessPolicyIpMode; cidrs: string[] };

export type AccessPolicyHeaderNode = {
  type: "HEADER";
  name: string;
  matchType: AccessPolicyHeaderMatchType;
  value?: string;
};

export type AccessPolicyNode = AccessPolicyGroupNode | AccessPolicyIpNode | AccessPolicyHeaderNode;
