import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
} from "@fms/common-utils/cookies/admin-auth-cookie-names";
import type { Response } from "express";
import { createAdminTokenCookieOptions } from "../_utils/create-admin-token-cookie-options/index.js";

export function clearAdminTokenCookies(res: Response): void {
  res.clearCookie(ADMIN_ACCESS_TOKEN_COOKIE, createAdminTokenCookieOptions());
  res.clearCookie(ADMIN_REFRESH_TOKEN_COOKIE, createAdminTokenCookieOptions());
}
