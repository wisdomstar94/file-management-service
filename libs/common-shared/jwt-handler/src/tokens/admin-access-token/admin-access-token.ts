import { signJwt } from "../sign-jwt/index.js";
import { verifyJwt } from "../verify-jwt/index.js";

const ADMIN_ACCESS_TOKEN_AUDIENCE = "fms-admin-access";

export const ADMIN_ACCESS_TOKEN_EXPIRES_IN_SECONDS = 60 * 15;

export function signAdminAccessToken(props: { adminAccountId: string; secret: string }): Promise<string> {
  return signJwt({
    payload: {},
    subject: props.adminAccountId,
    audience: ADMIN_ACCESS_TOKEN_AUDIENCE,
    secret: props.secret,
    expiresInSeconds: ADMIN_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  });
}

/** 유효하면 관리자 계정 식별키를, 아니면 `null` 을 반환합니다. api 와 admin-web 의 proxy 가 함께 씁니다. */
export async function verifyAdminAccessToken(props: { token: string; secret: string }): Promise<string | null> {
  const payload = await verifyJwt({ token: props.token, audience: ADMIN_ACCESS_TOKEN_AUDIENCE, secret: props.secret });
  return payload?.sub ?? null;
}
