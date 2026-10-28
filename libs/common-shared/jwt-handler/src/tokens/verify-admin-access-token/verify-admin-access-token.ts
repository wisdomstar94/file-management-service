import { ADMIN_ACCESS_TOKEN_AUDIENCE } from "../../_consts/admin-access-token-audience/index.js";
import { verifyJwt } from "../verify-jwt/index.js";

/** 유효하면 관리자 계정 식별키를, 아니면 `null` 을 반환합니다. api 와 admin-web 의 proxy 가 함께 씁니다. */
export async function verifyAdminAccessToken(props: { token: string; secret: string }): Promise<string | null> {
  const payload = await verifyJwt({ token: props.token, audience: ADMIN_ACCESS_TOKEN_AUDIENCE, secret: props.secret });
  return payload?.sub ?? null;
}
