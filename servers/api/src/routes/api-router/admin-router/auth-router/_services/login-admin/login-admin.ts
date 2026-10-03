import type { AdminLoginRequest } from "@fms/api-schemas/requests/admin-auth-request-schemas";
import type { AdminTokenResponse } from "@fms/api-schemas/responses/admin-auth-responses";
import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { verifyPassword } from "@fms/password-handler/passwords/verify-password";
import type { Request } from "express";
import { appDataSource } from "../../../../../../utils/app-data-source/index.js";
import { assertAccessPolicy } from "../../../../../../utils/assert-access-policy/index.js";
import { HttpError } from "../../../../../../utils/http-error/index.js";
import { issueAdminTokens } from "../issue-admin-tokens/index.js";

export async function loginAdmin(req: Request, body: AdminLoginRequest): Promise<AdminTokenResponse> {
  const account = await appDataSource.getRepository(AdminAccountEntity).findOne({
    where: { loginId: body.loginId },
    relations: { accessPolicyGroup: true },
  });
  const isValidPassword = account ? await verifyPassword(account.passwordHash, body.password) : false;
  if (!account?.accessPolicyGroup || !isValidPassword) {
    throw new HttpError(401, API_ERROR_CODE.INVALID_CREDENTIALS, "아이디 또는 비밀번호가 올바르지 않습니다.");
  }

  assertAccessPolicy(req, { group: account.accessPolicyGroup, account });
  return appDataSource.transaction((manager) => issueAdminTokens(manager, account.id));
}
