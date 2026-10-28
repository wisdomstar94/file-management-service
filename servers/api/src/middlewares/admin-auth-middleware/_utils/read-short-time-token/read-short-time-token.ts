import type { Request } from "express";
import { readBearerToken } from "../read-bearer-token/index.js";

/** 다운로드는 링크로 열리므로 short-time token 을 `shortTimeToken` 쿼리로도 받는다. */
export function readShortTimeToken(req: Request): string | null {
  const queryToken = req.method === "GET" ? req.query.shortTimeToken : undefined;
  return typeof queryToken === "string" && queryToken ? queryToken : readBearerToken(req);
}
