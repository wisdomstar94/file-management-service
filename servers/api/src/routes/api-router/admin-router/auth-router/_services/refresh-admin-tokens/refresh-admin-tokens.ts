import type { ADMIN_LOGIN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { AdminRefreshTokenEntity } from "@fms/database-entities/entities/admin-refresh-token-entity";
import type { Request } from "express";
import { appDataSource } from "../../../../../../utils/app-data-source/index.js";
import { assertAccessPolicy } from "../../../../../../utils/assert-access-policy/index.js";
import { HttpError } from "../../../../../../utils/http-error/index.js";
import { hashRefreshToken, issueAdminTokens } from "../issue-admin-tokens/index.js";

/** 사용한 refresh token 은 지우고 새로 발급한다(재사용 방지). */
export async function refreshAdminTokens(
  req: Request,
  refreshToken: string,
): Promise<ResBody<typeof ADMIN_LOGIN_API>["data"]> {
  return appDataSource.transaction(async (manager) => {
    const repository = manager.getRepository(AdminRefreshTokenEntity);
    const stored = await repository.findOne({
      where: { tokenHash: hashRefreshToken(refreshToken) },
      relations: { adminAccount: { accessPolicyGroup: true } },
    });
    const account = stored?.adminAccount;
    const isUsable = stored !== null && stored.expiresAt.getTime() > Date.now() && !!account?.accessPolicyGroup;
    if (!isUsable || !account?.accessPolicyGroup) {
      throw new HttpError(401, API_ERROR_CODE.UNAUTHORIZED, "로그인이 만료되었습니다.");
    }

    assertAccessPolicy(req, { group: account.accessPolicyGroup, account });
    await repository.delete(stored.id);
    return issueAdminTokens(manager, account.id);
  });
}
