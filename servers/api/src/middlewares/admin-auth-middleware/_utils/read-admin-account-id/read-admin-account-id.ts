import { verifyAdminAccessToken } from "@fms/jwt-handler/tokens/verify-admin-access-token";
import { verifyAdminShortTimeToken } from "@fms/jwt-handler/tokens/verify-admin-short-time-token";
import type { Request } from "express";
import { apiEnv } from "#/consts/api-env/index.js";
import { isShortTimeTokenTargetRequest } from "../is-short-time-token-target-request/index.js";
import { readBearerToken } from "../read-bearer-token/index.js";
import { readShortTimeToken } from "../read-short-time-token/index.js";

/** access token, 없으면 그 요청용 short-time token 을 검증해 관리자 계정 식별키를 돌려준다. */
export async function readAdminAccountId(req: Request): Promise<string | null> {
  const token = readBearerToken(req);
  const adminAccountId = token ? await verifyAdminAccessToken({ token, secret: apiEnv.adminAccessTokenSecret }) : null;
  if (adminAccountId) {
    return adminAccountId;
  }
  const shortTimeToken = readShortTimeToken(req);
  const verified = shortTimeToken
    ? await verifyAdminShortTimeToken({ token: shortTimeToken, secret: apiEnv.adminShortTimeTokenSecret })
    : null;
  return verified && isShortTimeTokenTargetRequest(req, verified.target) ? verified.adminAccountId : null;
}
