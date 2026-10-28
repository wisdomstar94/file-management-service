import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import type { AccessPolicyGroupEntity } from "@fms/database-entities/entities/access-policy-group-entity";
import { evaluateAccessPolicy } from "@fms/server-utils/access-policies/evaluate-access-policy";
import type { AccessPolicyDeniedDetails } from "@fms/types/errors/access-policy-denied-details";
import type { Request } from "express";
import { HttpError } from "#/classes/http-error/index.js";
import { readAccessPolicyRequest } from "#/utils/domains/access-policy/read-access-policy-request/index.js";

/** 접근 정책을 통과하지 못하면 차단 화면에 쓸 정보를 담아 403 을 던진다. */
export function assertAccessPolicy(
  req: Request,
  props: { group: AccessPolicyGroupEntity; account?: { loginId: string; nickname: string } },
): void {
  const request = readAccessPolicyRequest(req);
  const result = evaluateAccessPolicy(props.group.ruleTree, request);
  if (result.isAllowed) {
    return;
  }

  const details: AccessPolicyDeniedDetails = {
    accountLoginId: props.account?.loginId,
    accountNickname: props.account?.nickname,
    accessPolicyGroupName: props.group.name,
    failedReasons: result.failedReasons,
    requestIp: request.ip,
    requestedAt: new Date().toISOString(),
  };
  throw new HttpError(403, API_ERROR_CODE.ACCESS_POLICY_DENIED, "접근 정책에 의해 차단되었습니다.", details);
}
