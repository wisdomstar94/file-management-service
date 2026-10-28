import type { ADMIN_REFRESH_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
} from "@fms/common-utils/cookies/admin-auth-cookie-names";
import type { CookieOptions, Response } from "express";
import { apiEnv } from "#/utils/api-env/index.js";

// 관리자 웹 서버가 같은 쿠키를 읽고 갱신하므로 도메인 · 경로를 그쪽과 똑같이 맞춘다.
const baseOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: "lax",
  secure: apiEnv.isSecureCookie,
  domain: apiEnv.cookieDomain,
  path: "/",
});

export function writeAdminTokenCookies(res: Response, tokens: ResBody<typeof ADMIN_REFRESH_TOKEN_API>["data"]): void {
  res.cookie(ADMIN_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseOptions(),
    expires: new Date(tokens.accessTokenExpiresAt),
  });
  res.cookie(ADMIN_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseOptions(),
    expires: new Date(tokens.refreshTokenExpiresAt),
  });
}

export function clearAdminTokenCookies(res: Response): void {
  res.clearCookie(ADMIN_ACCESS_TOKEN_COOKIE, baseOptions());
  res.clearCookie(ADMIN_REFRESH_TOKEN_COOKIE, baseOptions());
}
