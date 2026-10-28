import { signJwt } from "../sign-jwt/index.js";
import { verifyJwt } from "../verify-jwt/index.js";

const ADMIN_SHORT_TIME_TOKEN_AUDIENCE = "fms-admin-short-time";

export const ADMIN_SHORT_TIME_TOKEN_EXPIRES_IN_SECONDS = 10;

/** 브라우저가 api 를 직접 호출하는 업로드 · 다운로드에서 이 토큰으로 허용할 동작과 대상 */
export type AdminShortTimeTokenTarget =
  | { purpose: "UPLOAD_DOCUMENT" }
  | { purpose: "UPLOAD_DOCUMENT_VERSION"; documentId: string }
  | { purpose: "DOWNLOAD_DOCUMENT_VERSION"; documentId: string; versionId: string };

export function signAdminShortTimeToken(props: {
  adminAccountId: string;
  target: AdminShortTimeTokenTarget;
  secret: string;
}): Promise<string> {
  return signJwt({
    payload: { target: props.target },
    subject: props.adminAccountId,
    audience: ADMIN_SHORT_TIME_TOKEN_AUDIENCE,
    secret: props.secret,
    expiresInSeconds: ADMIN_SHORT_TIME_TOKEN_EXPIRES_IN_SECONDS,
  });
}

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
