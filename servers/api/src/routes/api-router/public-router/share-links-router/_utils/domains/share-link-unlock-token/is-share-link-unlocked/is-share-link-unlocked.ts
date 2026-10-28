import type { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import { verifyJwt } from "@fms/jwt-handler/tokens/verify-jwt";
import { apiEnv } from "#/consts/api-env/index.js";
import { SHARE_LINK_UNLOCK_TOKEN_AUDIENCE } from "../_consts/share-link-unlock-token-audience/index.js";
import { readPasswordFingerprint } from "../_utils/read-password-fingerprint/index.js";

export async function isShareLinkUnlocked(link: ShareLinkEntity, token: string | undefined): Promise<boolean> {
  if (link.passwordHash === null) {
    return true;
  }
  if (!token) {
    return false;
  }
  const payload = await verifyJwt<{ pwf: string }>({
    token,
    audience: SHARE_LINK_UNLOCK_TOKEN_AUDIENCE,
    secret: apiEnv.shareLinkUnlockTokenSecret,
  });
  return payload?.sub === link.id && payload.pwf === readPasswordFingerprint(link);
}
