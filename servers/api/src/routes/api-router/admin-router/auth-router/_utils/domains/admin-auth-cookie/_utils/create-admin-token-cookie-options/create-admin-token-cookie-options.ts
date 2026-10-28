import type { CookieOptions } from "express";
import { apiEnv } from "#/consts/api-env/index.js";

// 관리자 웹 서버가 같은 쿠키를 읽고 갱신하므로 도메인 · 경로를 그쪽과 똑같이 맞춘다.
export const createAdminTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: "lax",
  secure: apiEnv.isSecureCookie,
  domain: apiEnv.cookieDomain,
  path: "/",
});
