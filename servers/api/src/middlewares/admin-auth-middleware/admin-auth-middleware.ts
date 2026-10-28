import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "#/classes/http-error/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { readAdminAccountId } from "./_utils/read-admin-account-id/index.js";

/** access token(없으면 그 요청용 short-time token)을 검증하고, 계정 · 권한 그룹 · 접근 정책 그룹을 읽어 `req.admin` 에 담는다. */
export async function adminAuthMiddleware(req: Request, _: Response, next: NextFunction) {
  const adminAccountId = await readAdminAccountId(req);
  const account = adminAccountId
    ? await appDataSource.getRepository(AdminAccountEntity).findOne({
        where: { id: adminAccountId },
        relations: { permissionGroup: { permissions: true }, accessPolicyGroup: true },
      })
    : null;
  if (!account?.permissionGroup || !account.accessPolicyGroup) {
    throw new HttpError(401, API_ERROR_CODE.UNAUTHORIZED, "로그인이 필요합니다.");
  }

  req.admin = {
    account,
    permissionGroup: account.permissionGroup,
    accessPolicyGroup: account.accessPolicyGroup,
    permissionCodes: new Set((account.permissionGroup.permissions ?? []).map((permission) => permission.code)),
  };
  next();
}
