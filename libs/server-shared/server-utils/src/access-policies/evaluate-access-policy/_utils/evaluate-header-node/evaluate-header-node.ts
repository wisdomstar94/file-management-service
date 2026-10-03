import type { AccessPolicyHeaderNode } from "@fms/common-utils/access-policies/access-policy-node";

export type RequestHeaders = Record<string, string | string[] | undefined>;

function readHeader(headers: RequestHeaders, name: string): string | undefined {
  const value = headers[name.toLowerCase()];
  return Array.isArray(value) ? value.join(", ") : value;
}

function matchHeader(node: AccessPolicyHeaderNode, actual: string | undefined): boolean {
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

export function evaluateHeaderNode(node: AccessPolicyHeaderNode, headers: RequestHeaders): string | null {
  return matchHeader(node, readHeader(headers, node.name)) ? null : `헤더 제한 · ${node.name} 조건 불일치`;
}
