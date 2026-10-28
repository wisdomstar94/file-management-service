import { randomUUID } from "node:crypto";
import type { ADMIN_LOGIN_API, ADMIN_REFRESH_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ReqBody, ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { verifyPassword } from "@fms/password-handler/passwords/verify-password";
import type { Request } from "express";
import { HttpError } from "#/classes/http-error/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { assertAccessPolicy } from "#/utils/domains/access-policy/assert-access-policy/index.js";
import { issueAdminTokens } from "../issue-admin-tokens/index.js";

export async function loginAdmin(
  req: Request,
  body: ReqBody<typeof ADMIN_LOGIN_API>,
): Promise<ResBody<typeof ADMIN_REFRESH_TOKEN_API>["data"]> {
  const account = await appDataSource.getRepository(AdminAccountEntity).findOne({
    where: { loginId: body.loginId },
    relations: { accessPolicyGroup: true },
  });
  const isValidPassword = account ? await verifyPassword(account.passwordHash, body.password) : false;
  if (!account?.accessPolicyGroup || !isValidPassword) {
    throw new HttpError(401, API_ERROR_CODE.INVALID_CREDENTIALS, "아이디 또는 비밀번호가 올바르지 않습니다.");
  }

  assertAccessPolicy(req, { group: account.accessPolicyGroup, account });
  return appDataSource.transaction((manager) =>
    issueAdminTokens(manager, { adminAccountId: account.id, familyId: randomUUID() }),
  );
}
