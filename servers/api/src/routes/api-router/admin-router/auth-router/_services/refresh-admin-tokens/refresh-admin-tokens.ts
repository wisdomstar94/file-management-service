import type { ADMIN_REFRESH_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import { AdminRefreshTokenEntity } from "@fms/database-entities/entities/admin-refresh-token-entity";
import type { Request } from "express";
import { HttpError } from "#/classes/http-error/index.js";
import { apiEnv } from "#/consts/api-env/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { assertAccessPolicy } from "#/utils/domains/access-policy/assert-access-policy/index.js";
import { hashRefreshToken } from "../../_utils/hash-refresh-token/index.js";
import { issueAdminTokens } from "../issue-admin-tokens/index.js";

/**
 * 쓴 refresh token 도 유예 시간 동안은 받아 줘서, 동시에 들어온 갱신 요청이 모두 새 토큰을 받게 한다.
 * 유예 시간이 지난 뒤 다시 쓰이면 탈취로 보고 그 계열을 폐기한다.
 */
export async function refreshAdminTokens(
  req: Request,
  refreshToken: string,
): Promise<ResBody<typeof ADMIN_REFRESH_TOKEN_API>["data"]> {
  // 401 을 트랜잭션 안에서 throw 하면 계열 폐기까지 롤백되므로, 커밋한 뒤에 throw 한다.
  const issued = await appDataSource.transaction(async (manager) => {
    const repository = manager.getRepository(AdminRefreshTokenEntity);
    const stored = await repository.findOne({
      where: { tokenHash: hashRefreshToken(refreshToken) },
      relations: { adminAccount: { accessPolicyGroup: true } },
    });
    const account = stored?.adminAccount;
    const now = Date.now();
    if (!stored || stored.expiresAt.getTime() <= now || !account?.accessPolicyGroup) {
      return null;
    }
    if (stored.usedAt && stored.usedAt.getTime() + apiEnv.adminRefreshTokenReuseGraceSeconds * 1000 <= now) {
      await repository.delete({ familyId: stored.familyId });
      return null;
    }

    assertAccessPolicy(req, { group: account.accessPolicyGroup, account });
    if (!stored.usedAt) {
      await repository.update(stored.id, { usedAt: new Date(now) });
    }
    return issueAdminTokens(manager, { adminAccountId: account.id, familyId: stored.familyId });
  });
  if (!issued) {
    throw new HttpError(401, API_ERROR_CODE.UNAUTHORIZED, "로그인이 만료되었습니다.");
  }
  return issued;
}
