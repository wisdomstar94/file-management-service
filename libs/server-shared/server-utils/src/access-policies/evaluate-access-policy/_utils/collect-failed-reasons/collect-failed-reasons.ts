import type { AccessPolicyNode } from "@fms/common-utils/access-policies/access-policy-node";
import type { AccessPolicyRequest } from "../../evaluate-access-policy.js";
import { evaluateHeaderNode } from "../evaluate-header-node/index.js";
import { evaluateIpNode } from "../evaluate-ip-node/index.js";

export function collectFailedReasons(node: AccessPolicyNode, request: AccessPolicyRequest): string[] {
  if (node.type === "IP") {
    const reason = evaluateIpNode(node, request.ip);
    return reason ? [reason] : [];
  }
  if (node.type === "HEADER") {
    const reason = evaluateHeaderNode(node, request.headers);
    return reason ? [reason] : [];
  }

  const childReasons = node.children.map((child) => collectFailedReasons(child, request));
  if (node.operator === "AND") {
    return childReasons.flat();
  }
  const isAnyPassed = childReasons.length === 0 || childReasons.some((reasons) => reasons.length === 0);
  return isAnyPassed ? [] : childReasons.flat();
}
