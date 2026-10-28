import type { NextFunction, Request, Response } from "express";
import { assertAccessPolicy } from "#/utils/domains/access-policy/assert-access-policy/index.js";
import { readAdmin } from "#/utils/domains/admin-auth/read-admin/index.js";

/** 이미 로그인된 요청도 매번 계정의 접근 정책을 다시 평가한다. */
export function accessPolicyMiddleware(req: Request, _: Response, next: NextFunction) {
  const admin = readAdmin(req);
  assertAccessPolicy(req, { group: admin.accessPolicyGroup, account: admin.account });
  next();
}
