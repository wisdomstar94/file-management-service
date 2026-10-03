import { buildApiForwardHeaders } from "@fms/web-utils/requests/build-api-forward-headers";
import { cookies, headers } from "next/headers";
import { readUnlockCookieName } from "../share-link-unlock-cookie";
import { webEnv } from "../web-env";

/** 공개 링크 api 호출. 원래 요청 IP · 헤더와 그 링크의 잠금 해제 토큰을 함께 넘긴다. */
export async function publicApiFetch(token: string, subPath = "", init: RequestInit = {}): Promise<Response> {
  const forward = buildApiForwardHeaders(await headers(), { trustedProxyHops: webEnv.trustedProxyHops });
  const unlockToken = (await cookies()).get(readUnlockCookieName(token))?.value;
  if (unlockToken) {
    forward.set("x-share-link-unlock-token", unlockToken);
  }
  for (const [name, value] of new Headers(init.headers).entries()) {
    forward.set(name, value);
  }
  return fetch(`${webEnv.apiInternalUrl}/api/public/share-links/${encodeURIComponent(token)}${subPath}`, {
    ...init,
    headers: forward,
    cache: "no-store",
  });
}
