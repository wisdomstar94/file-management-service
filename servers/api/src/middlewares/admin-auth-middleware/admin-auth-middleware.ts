import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { verifyAdminAccessToken } from "@fms/jwt-handler/tokens/admin-access-token";
import type { NextFunction, Request, Response } from "express";
import { apiEnv } from "../../utils/api-env/index.js";
import { appDataSource } from "../../utils/app-data-source/index.js";
import { HttpError } from "../../utils/http-error/index.js";

function readBearerToken(req: Request): string | null {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  return scheme === "Bearer" && token ? token : null;
}

/** access token 을 검증하고, 계정 · 권한 그룹 · 접근 정책 그룹을 읽어 `req.admin` 에 담는다. */
export async function adminAuthMiddleware(req: Request, _: Response, next: NextFunction) {
  const token = readBearerToken(req);
  const adminAccountId = token ? await verifyAdminAccessToken({ token, secret: apiEnv.jwtSecret }) : null;
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
