import { ADMIN_SHORT_TIME_TOKEN_AUDIENCE } from "../../_consts/admin-short-time-token-audience/index.js";
import type { AdminShortTimeTokenTarget } from "../../types/admin-short-time-token-target/index.js";
import { verifyJwt } from "../verify-jwt/index.js";

/** 유효하면 관리자 계정 식별키와 허용 대상을, 아니면 `null` 을 반환합니다. */
export async function verifyAdminShortTimeToken(props: {
  token: string;
  secret: string;
}): Promise<{ adminAccountId: string; target: AdminShortTimeTokenTarget } | null> {
  const payload = await verifyJwt<{ target?: AdminShortTimeTokenTarget }>({
    token: props.token,
    audience: ADMIN_SHORT_TIME_TOKEN_AUDIENCE,
    secret: props.secret,
  });
  if (!payload?.target) {
    return null;
  }
  return { adminAccountId: payload.sub, target: payload.target };
}
