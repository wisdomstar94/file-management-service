import type { AccessPolicyHeaderNode } from "@fms/common-utils/access-policies/access-policy-node";
import { matchHeader } from "./_utils/match-header/index.js";
import { readHeader } from "./_utils/read-header/index.js";

export type RequestHeaders = Record<string, string | string[] | undefined>;

export function evaluateHeaderNode(node: AccessPolicyHeaderNode, headers: RequestHeaders): string | null {
  return matchHeader(node, readHeader(headers, node.name)) ? null : `헤더 제한 · ${node.name} 조건 불일치`;
}
