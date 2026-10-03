import type { AdminTokenResponse } from "@fms/api-schemas/responses/admin-auth-responses";
import { verifyAdminAccessToken } from "@fms/jwt-handler/tokens/admin-access-token";
import { requestAdminTokenRefresh } from "../request-admin-token-refresh";
import { webEnv } from "../web-env";

/**
 * 유효한 access token 을 돌려준다. 없거나 만료됐으면 refresh token 으로 새로 받아 `refreshed` 에 담는다.
 * 둘 다 안 되면 `accessToken` 이 `null` 이다.
 */
export async function resolveAdminAccessToken(props: {
  incoming: Headers;
  accessToken?: string;
  refreshToken?: string;
}): Promise<{ accessToken: string | null; refreshed: AdminTokenResponse | null }> {
  const { incoming, accessToken, refreshToken } = props;
  const isValid = accessToken
    ? (await verifyAdminAccessToken({ token: accessToken, secret: webEnv.jwtSecret })) !== null
    : false;
  if (accessToken && isValid) {
    return { accessToken, refreshed: null };
  }
  if (!refreshToken) {
    return { accessToken: null, refreshed: null };
  }
  const refreshed = await requestAdminTokenRefresh(incoming, refreshToken);
  return { accessToken: refreshed?.accessToken ?? null, refreshed };
}
