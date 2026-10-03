import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { Request } from "express";
import { HttpError } from "../http-error/index.js";

/** `adminAuthMiddleware` 를 거친 요청의 관리자 정보. 거치지 않았으면 401. */
export function readAdmin(req: Request): NonNullable<Request["admin"]> {
  if (!req.admin) {
    throw new HttpError(401, API_ERROR_CODE.UNAUTHORIZED, "로그인이 필요합니다.");
  }
  return req.admin;
}
