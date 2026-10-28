import type { Request } from "express";

/** 요청 Cookie 헤더에서 쿠키 하나를 읽는다. 쿠키를 쓰는 곳이 몇 군데뿐이라 cookie-parser 대신 직접 읽는다. */
export function readCookie(req: Request, name: string): string | undefined {
  for (const pair of (req.headers.cookie ?? "").split(";")) {
    const separatorIndex = pair.indexOf("=");
    if (separatorIndex !== -1 && pair.slice(0, separatorIndex).trim() === name) {
      const value = pair.slice(separatorIndex + 1).trim();
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return undefined;
}
