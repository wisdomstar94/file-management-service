import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { AdminAccountEntity } from "@fms/database-entities/entities/admin-account-entity";
import { verifyAdminAccessToken } from "@fms/jwt-handler/tokens/admin-access-token";
import { type AdminTransferTarget, verifyAdminTransferToken } from "@fms/jwt-handler/tokens/admin-transfer-token";
import type { NextFunction, Request, Response } from "express";
import { apiEnv } from "../../utils/api-env/index.js";
import { appDataSource } from "../../utils/app-data-source/index.js";
import { HttpError } from "../../utils/http-error/index.js";

function readBearerToken(req: Request): string | null {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  return scheme === "Bearer" && token ? token : null;
}

/** 다운로드는 링크로 열리므로 transfer token 을 `transferToken` 쿼리로도 받는다. */
function readTransferToken(req: Request): string | null {
  const queryToken = req.method === "GET" ? req.query.transferToken : undefined;
  return typeof queryToken === "string" && queryToken ? queryToken : readBearerToken(req);
}

/** transfer token 은 발급받을 때 지정한 동작 · 대상 요청에만 쓸 수 있다. */
function isTransferTargetRequest(req: Request, target: AdminTransferTarget): boolean {
  const path = req.originalUrl.split("?")[0].replace(/\/+$/, "");
  switch (target.purpose) {
    case "UPLOAD_DOCUMENT":
      return req.method === "POST" && path === "/api/admin/documents";
    case "UPLOAD_DOCUMENT_VERSION":
      return req.method === "POST" && path === `/api/admin/documents/${target.documentId}/versions`;
    case "DOWNLOAD_DOCUMENT_VERSION":
      return (
        req.method === "GET" &&
        path === `/api/admin/documents/${target.documentId}/versions/${target.versionId}/download`
      );
  }
}

/** access token, 없으면 그 요청용 transfer token 을 검증해 관리자 계정 식별키를 돌려준다. */
async function readAdminAccountId(req: Request): Promise<string | null> {
  const token = readBearerToken(req);
  const adminAccountId = token ? await verifyAdminAccessToken({ token, secret: apiEnv.jwtSecret }) : null;
  if (adminAccountId) {
    return adminAccountId;
  }
  const transferToken = readTransferToken(req);
  const transfer = transferToken
    ? await verifyAdminTransferToken({ token: transferToken, secret: apiEnv.jwtSecret })
    : null;
  return transfer && isTransferTargetRequest(req, transfer.target) ? transfer.adminAccountId : null;
}

/** access token(없으면 그 요청용 transfer token)을 검증하고, 계정 · 권한 그룹 · 접근 정책 그룹을 읽어 `req.admin` 에 담는다. */
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
