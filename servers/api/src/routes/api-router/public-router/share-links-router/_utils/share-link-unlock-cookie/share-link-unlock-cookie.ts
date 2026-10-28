import type { Request, Response } from "express";
import { apiEnv } from "#/utils/api-env/index.js";
import { readCookie } from "#/utils/read-cookie/index.js";

// 링크마다 잠금 해제 토큰을 따로 둔다. 쿠키 경로를 그 링크의 api 로 한정해 다른 링크에 섞이지 않게 한다.
const readCookieName = (shareLinkKey: string) => `fms_share_unlock_${shareLinkKey}`;
const readCookiePath = (shareLinkKey: string) => `/api/public/share-links/${encodeURIComponent(shareLinkKey)}`;

export function writeShareLinkUnlockCookie(
  res: Response,
  props: { shareLinkKey: string; unlockToken: string; expiresAt: Date },
) {
  res.cookie(readCookieName(props.shareLinkKey), props.unlockToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: apiEnv.isSecureCookie,
    path: readCookiePath(props.shareLinkKey),
    expires: props.expiresAt,
  });
}

export function readShareLinkUnlockCookie(req: Request, shareLinkKey: string): string | undefined {
  return readCookie(req, readCookieName(shareLinkKey));
}
