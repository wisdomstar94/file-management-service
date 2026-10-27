import type { ADMIN_LOGIN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { webEnv } from "../web-env";

export const ACCESS_TOKEN_COOKIE = "fms_admin_at";
export const REFRESH_TOKEN_COOKIE = "fms_admin_rt";

type CookieWriter = {
  set: (name: string, value: string, options: Record<string, unknown>) => unknown;
  delete: (name: string) => unknown;
};

const baseOptions = () => ({ httpOnly: true, sameSite: "lax" as const, secure: webEnv.isSecureCookie, path: "/" });

export function writeAdminTokenCookies(cookies: CookieWriter, tokens: ResBody<typeof ADMIN_LOGIN_API>["data"]): void {
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
  cookies.delete(ACCESS_TOKEN_COOKIE);
  cookies.delete(REFRESH_TOKEN_COOKIE);
}
