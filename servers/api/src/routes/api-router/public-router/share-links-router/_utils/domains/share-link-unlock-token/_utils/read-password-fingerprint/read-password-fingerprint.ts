import { createHash } from "node:crypto";
import type { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";

// 비밀번호를 바꾸면 이전에 발급한 잠금 해제 토큰이 무효가 되도록 해시의 지문을 담는다.
export function readPasswordFingerprint(link: ShareLinkEntity): string {
  return createHash("sha256")
    .update(link.passwordHash ?? "")
    .digest("hex")
    .slice(0, 16);
}
