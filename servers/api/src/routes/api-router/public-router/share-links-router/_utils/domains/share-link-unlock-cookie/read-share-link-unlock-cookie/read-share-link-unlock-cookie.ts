import type { Request } from "express";
import { readCookie } from "#/utils/commons/read-cookie/index.js";
import { readShareLinkUnlockCookieName } from "../_utils/read-share-link-unlock-cookie-name/index.js";

export function readShareLinkUnlockCookie(req: Request, shareLinkKey: string): string | undefined {
  return readCookie(req, readShareLinkUnlockCookieName(shareLinkKey));
}
