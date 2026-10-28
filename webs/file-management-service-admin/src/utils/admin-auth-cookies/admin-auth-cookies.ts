import type { ADMIN_REFRESH_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
} from "@fms/common-utils/cookies/admin-auth-cookie-names";
import { webEnv } from "../web-env";

export const ACCESS_TOKEN_COOKIE = ADMIN_ACCESS_TOKEN_COOKIE;
export const REFRESH_TOKEN_COOKIE = ADMIN_REFRESH_TOKEN_COOKIE;

type CookieWriter = {
  set: (name: string, value: string, options: Record<string, unknown>) => unknown;
  delete: (options: { name: string; domain?: string; path: string }) => unknown;
};

// 로그인 · 로그아웃은 api 가 쿠키를 심고 지운다. 같은 쿠키를 갱신하도록 도메인 · 경로를 api 와 똑같이 맞춘다.
const baseOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: webEnv.isSecureCookie,
  domain: webEnv.cookieDomain,
  path: "/",
});

export function writeAdminTokenCookies(
  cookies: CookieWriter,
  tokens: ResBody<typeof ADMIN_REFRESH_TOKEN_API>["data"],
): void {
  cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseOptions(),
    expires: new Date(tokens.accessTokenExpiresAt),
  });
  cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseOptions(),
    expires: new Date(tokens.refreshTokenExpiresAt),
  });
}

export function clearAdminTokenCookies(cookies: CookieWriter): void {
  cookies.delete({ name: ACCESS_TOKEN_COOKIE, domain: webEnv.cookieDomain, path: "/" });
  cookies.delete({ name: REFRESH_TOKEN_COOKIE, domain: webEnv.cookieDomain, path: "/" });
}
