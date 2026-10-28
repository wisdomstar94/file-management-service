import type { AccessPolicyHeaderNode } from "@fms/types/access-policies/access-policy-node";

export function matchHeader(node: AccessPolicyHeaderNode, actual: string | undefined): boolean {
  if (node.matchType === "EXISTS") {
    return actual !== undefined;
  }
  if (actual === undefined) {
    return false;
  }
  if (node.matchType === "EQUALS") {
    return actual === node.value;
  }
  if (node.matchType === "CONTAINS") {
    return actual.includes(node.value ?? "");
  }
  try {
    return new RegExp(node.value ?? "").test(actual);
  } catch {
    return false;
  }
}
