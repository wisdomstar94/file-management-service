import type { AccessPolicyRequest } from "@fms/server-utils/types/access-policy-request";
import type { Request } from "express";

/** 접근 정책 평가에 쓸 요청 IP(`trust proxy` 설정 반영)와 헤더. */
export function readAccessPolicyRequest(req: Request): AccessPolicyRequest {
  return { ip: req.ip ?? req.socket.remoteAddress ?? "", headers: req.headers };
}
