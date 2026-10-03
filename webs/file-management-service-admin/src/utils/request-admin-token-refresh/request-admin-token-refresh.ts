import type { AdminTokenResponse } from "@fms/api-schemas/responses/admin-auth-responses";
import type { ApiSuccessBody } from "@fms/common-utils/responses/api-response-body";
import { buildApiForwardHeaders } from "../build-api-forward-headers";
import { webEnv } from "../web-env";

/** refresh token 으로 새 토큰을 받는다. 만료 · 폐기 · 접근 정책 차단이면 `null` */
export async function requestAdminTokenRefresh(
  incoming: Headers,
  refreshToken: string,
): Promise<AdminTokenResponse | null> {
  const headers = buildApiForwardHeaders(incoming);
  headers.set("content-type", "application/json");
  const res = await fetch(`${webEnv.apiInternalUrl}/api/admin/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  return res.ok ? ((await res.json()) as ApiSuccessBody<AdminTokenResponse>).data : null;
}
