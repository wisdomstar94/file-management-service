import type { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import { signJwt } from "@fms/jwt-handler/tokens/sign-jwt";
import { apiEnv } from "#/consts/api-env/index.js";
import { SHARE_LINK_UNLOCK_TOKEN_AUDIENCE } from "../_consts/share-link-unlock-token-audience/index.js";
import { readPasswordFingerprint } from "../_utils/read-password-fingerprint/index.js";

export function signShareLinkUnlockToken(link: ShareLinkEntity): Promise<string> {
  return signJwt({
    payload: { pwf: readPasswordFingerprint(link) },
    subject: link.id,
    audience: SHARE_LINK_UNLOCK_TOKEN_AUDIENCE,
    secret: apiEnv.shareLinkUnlockTokenSecret,
    expiresInSeconds: apiEnv.shareLinkUnlockExpiresInSeconds,
  });
}
