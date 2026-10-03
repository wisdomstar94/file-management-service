import { createHash } from "node:crypto";
import type { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import { signJwt } from "@fms/jwt-handler/tokens/sign-jwt";
import { verifyJwt } from "@fms/jwt-handler/tokens/verify-jwt";
import { apiEnv } from "../../../../../../utils/api-env/index.js";

const AUDIENCE = "fms-share-link-unlock";
export const SHARE_LINK_UNLOCK_TOKEN_HEADER = "x-share-link-unlock-token";

// 비밀번호를 바꾸면 이전에 발급한 잠금 해제 토큰이 무효가 되도록 해시의 지문을 담는다.
function readPasswordFingerprint(link: ShareLinkEntity): string {
  return createHash("sha256")
    .update(link.passwordHash ?? "")
    .digest("hex")
    .slice(0, 16);
}

export function signShareLinkUnlockToken(link: ShareLinkEntity): Promise<string> {
  return signJwt({
    payload: { pwf: readPasswordFingerprint(link) },
    subject: link.id,
    audience: AUDIENCE,
    secret: apiEnv.jwtSecret,
    expiresInSeconds: apiEnv.shareLinkUnlockExpiresInSeconds,
  });
}

export async function isShareLinkUnlocked(link: ShareLinkEntity, token: string | undefined): Promise<boolean> {
  if (link.passwordHash === null) {
    return true;
  }
  if (!token) {
    return false;
  }
  const payload = await verifyJwt<{ pwf: string }>({ token, audience: AUDIENCE, secret: apiEnv.jwtSecret });
  return payload?.sub === link.id && payload.pwf === readPasswordFingerprint(link);
}
