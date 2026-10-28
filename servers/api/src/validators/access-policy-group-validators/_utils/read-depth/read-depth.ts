import type { AccessPolicyNode } from "@fms/common-utils/access-policies/access-policy-node";

export function readDepth(node: AccessPolicyNode): number {
  if (node.type !== "GROUP") {
    return 1;
  }
  return 1 + Math.max(...node.children.map(readDepth));
}
