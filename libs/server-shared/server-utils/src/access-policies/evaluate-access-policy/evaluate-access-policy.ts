import type { AccessPolicyNode } from "@fms/common-utils/access-policies/access-policy-node";
import { collectFailedReasons } from "./_utils/collect-failed-reasons/index.js";
import type { RequestHeaders } from "./_utils/evaluate-header-node/index.js";

export type AccessPolicyRequest = { ip: string; headers: RequestHeaders };

export type AccessPolicyResult = { isAllowed: boolean; failedReasons: string[] };

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
