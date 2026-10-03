import type { AccessPolicyNode } from "@fms/common-utils/access-policies/access-policy-node";
import { evaluateHeaderNode, type RequestHeaders } from "./_utils/evaluate-header-node/index.js";
import { evaluateIpNode } from "./_utils/evaluate-ip-node/index.js";

export type AccessPolicyRequest = { ip: string; headers: RequestHeaders };

export type AccessPolicyResult = { isAllowed: boolean; failedReasons: string[] };

function collectFailedReasons(node: AccessPolicyNode, request: AccessPolicyRequest): string[] {
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

/**
 * 접근 정책 트리를 요청 IP · 헤더로 평가합니다. 트리가 `null` 이면 항상 허용합니다.
 * 차단되면 `failedReasons` 에 통과하지 못한 규칙 설명을 담습니다.
 */
export function evaluateAccessPolicy(node: AccessPolicyNode | null, request: AccessPolicyRequest): AccessPolicyResult {
  if (node === null) {
    return { isAllowed: true, failedReasons: [] };
  }
  const failedReasons = collectFailedReasons(node, request);
  return { isAllowed: failedReasons.length === 0, failedReasons };
}
