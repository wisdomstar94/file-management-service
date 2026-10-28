import type { AccessPolicyHeaderNode } from "@fms/types/access-policies/access-policy-node";
import type { RequestHeaders } from "../../../../types/request-headers/index.js";
import { matchHeader } from "./_utils/match-header/index.js";
import { readHeader } from "./_utils/read-header/index.js";

export function evaluateHeaderNode(node: AccessPolicyHeaderNode, headers: RequestHeaders): string | null {
  return matchHeader(node, readHeader(headers, node.name)) ? null : `헤더 제한 · ${node.name} 조건 불일치`;
}
