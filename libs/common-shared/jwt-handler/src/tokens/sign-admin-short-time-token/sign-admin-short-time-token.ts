import { ADMIN_SHORT_TIME_TOKEN_AUDIENCE } from "../../_consts/admin-short-time-token-audience/index.js";
import { ADMIN_SHORT_TIME_TOKEN_EXPIRES_IN_SECONDS } from "../../consts/admin-short-time-token-expires-in-seconds/index.js";
import type { AdminShortTimeTokenTarget } from "../../types/admin-short-time-token-target/index.js";
import { signJwt } from "../sign-jwt/index.js";

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
