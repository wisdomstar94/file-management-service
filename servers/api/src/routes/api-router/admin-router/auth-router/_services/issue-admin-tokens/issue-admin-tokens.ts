import { createHash, randomBytes } from "node:crypto";
import type { ADMIN_REFRESH_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { AdminRefreshTokenEntity } from "@fms/database-entities/entities/admin-refresh-token-entity";
import {
  ADMIN_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  signAdminAccessToken,
} from "@fms/jwt-handler/tokens/admin-access-token";
import type { EntityManager } from "typeorm";
import { apiEnv } from "../../../../../../utils/api-env/index.js";

export function hashRefreshToken(refreshToken: string): string {
  return createHash("sha256").update(refreshToken).digest("hex");
}

/** access token 과 refresh token 을 새로 발급하고 최근 접속일을 갱신한다. refresh token 은 해시만 저장한다. */
export async function issueAdminTokens(
  manager: EntityManager,
  adminAccountId: string,
): Promise<ResBody<typeof ADMIN_REFRESH_TOKEN_API>["data"]> {
  const now = Date.now();
  const refreshToken = randomBytes(32).toString("base64url");
  const refreshTokenExpiresAt = new Date(now + apiEnv.refreshTokenDays * 24 * 60 * 60 * 1000);

  await manager.getRepository(AdminRefreshTokenEntity).insert({
    adminAccountId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: refreshTokenExpiresAt,
  });
  await manager.getRepository(AdminAccountEntity).update(adminAccountId, { lastAccessedAt: new Date(now) });

  return {
    accessToken: await signAdminAccessToken({ adminAccountId, secret: apiEnv.adminAccessTokenSecret }),
    accessTokenExpiresAt: new Date(now + ADMIN_ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString(),
    refreshToken,
    refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
  };
}
