import type { Response } from "express";
import { apiEnv } from "#/consts/api-env/index.js";
import { readShareLinkUnlockCookieName } from "../_utils/read-share-link-unlock-cookie-name/index.js";
import { readShareLinkUnlockCookiePath } from "../_utils/read-share-link-unlock-cookie-path/index.js";

export function writeShareLinkUnlockCookie(
  res: Response,
  props: { shareLinkKey: string; unlockToken: string; expiresAt: Date },
) {
  res.cookie(readShareLinkUnlockCookieName(props.shareLinkKey), props.unlockToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: apiEnv.isSecureCookie,
    path: readShareLinkUnlockCookiePath(props.shareLinkKey),
    expires: props.expiresAt,
  });
}
