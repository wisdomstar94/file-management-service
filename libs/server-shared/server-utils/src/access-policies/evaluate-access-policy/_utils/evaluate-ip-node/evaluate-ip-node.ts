import type { AccessPolicyIpNode } from "@fms/types/access-policies/access-policy-node";
import { isIpInCidr } from "../../../../networks/is-ip-in-cidr/index.js";

export function evaluateIpNode(node: AccessPolicyIpNode, ip: string): string | null {
  const isListed = node.cidrs.some((cidr) => isIpInCidr(ip, cidr));
  if (node.mode === "ALLOW_ALL_EXCEPT") {
    return isListed ? "IP 제한 · 차단 목록에 있음" : null;
  }
  return isListed ? null : "IP 제한 · 허용 목록에 없음";
}
