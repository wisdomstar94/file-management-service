import { ADMIN_ACCESS_TOKEN_AUDIENCE } from "../../_consts/admin-access-token-audience/index.js";
import { ADMIN_ACCESS_TOKEN_EXPIRES_IN_SECONDS } from "../../consts/admin-access-token-expires-in-seconds/index.js";
import { signJwt } from "../sign-jwt/index.js";

export function signAdminAccessToken(props: { adminAccountId: string; secret: string }): Promise<string> {
  return signJwt({
    payload: {},
    subject: props.adminAccountId,
    audience: ADMIN_ACCESS_TOKEN_AUDIENCE,
    secret: props.secret,
    expiresInSeconds: ADMIN_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  });
}
