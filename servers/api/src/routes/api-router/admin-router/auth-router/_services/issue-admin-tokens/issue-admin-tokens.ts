import { randomBytes } from "node:crypto";
import type { ADMIN_REFRESH_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { AdminRefreshTokenEntity } from "@fms/database-entities/entities/admin-refresh-token-entity";
import { ADMIN_ACCESS_TOKEN_EXPIRES_IN_SECONDS } from "@fms/jwt-handler/consts/admin-access-token-expires-in-seconds";
import { signAdminAccessToken } from "@fms/jwt-handler/tokens/sign-admin-access-token";
import { type EntityManager, LessThan } from "typeorm";
import { apiEnv } from "#/consts/api-env/index.js";
import { hashRefreshToken } from "../../_utils/hash-refresh-token/index.js";

/**
 * access token 과 refresh token 을 새로 발급하고 최근 접속일을 갱신한다. refresh token 은 해시만 저장한다.
 * 쓴 refresh token 은 재사용 감지에 쓰려고 만료 시각까지 남기므로, 발급할 때 그 계정의 만료된 행을 지운다.
 * `familyId` 는 로그인이면 새 값, 갱신이면 쓴 refresh token 의 값을 넘긴다.
 */
export async function issueAdminTokens(
  manager: EntityManager,
  props: { adminAccountId: string; familyId: string },
): Promise<ResBody<typeof ADMIN_REFRESH_TOKEN_API>["data"]> {
  const { adminAccountId, familyId } = props;
  const now = Date.now();
  const refreshToken = randomBytes(32).toString("base64url");
  const refreshTokenExpiresAt = new Date(now + apiEnv.refreshTokenDays * 24 * 60 * 60 * 1000);

  const repository = manager.getRepository(AdminRefreshTokenEntity);
  await repository.delete({ adminAccountId, expiresAt: LessThan(new Date(now)) });
  await repository.insert({
    adminAccountId,
    familyId,
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
