import type { ADMIN_REFRESH_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
} from "@fms/common-utils/cookies/admin-auth-cookie-names";
import type { Response } from "express";
import { createAdminTokenCookieOptions } from "../_utils/create-admin-token-cookie-options/index.js";

export function writeAdminTokenCookies(res: Response, tokens: ResBody<typeof ADMIN_REFRESH_TOKEN_API>["data"]): void {
  res.cookie(ADMIN_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...createAdminTokenCookieOptions(),
    expires: new Date(tokens.accessTokenExpiresAt),
  });
  res.cookie(ADMIN_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...createAdminTokenCookieOptions(),
    expires: new Date(tokens.refreshTokenExpiresAt),
  });
}
