import type { ADMIN_ME_API, ADMIN_TRANSFER_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { PermissionCode } from "@fms/common-utils/permissions/permission-code-registry";
import { AdminRefreshTokenEntity } from "@fms/database-entities/entities/admin-refresh-token-entity";
import {
  ADMIN_TRANSFER_TOKEN_EXPIRES_IN_SECONDS,
  type AdminTransferTarget,
  signAdminTransferToken,
} from "@fms/jwt-handler/tokens/admin-transfer-token";
import { Router } from "express";
import { accessPolicyMiddleware } from "../../../../middlewares/access-policy-middleware/index.js";
import { adminAuthMiddleware } from "../../../../middlewares/admin-auth-middleware/index.js";
import { apiEnv } from "../../../../utils/api-env/index.js";
import { appDataSource } from "../../../../utils/app-data-source/index.js";
import { generateCommonRes } from "../../../../utils/generate-common-res/index.js";
import { HttpError } from "../../../../utils/http-error/index.js";
import { parseRequest } from "../../../../utils/parse-request/index.js";
import { readAdmin } from "../../../../utils/read-admin/index.js";
import {
  adminLoginRequestSchema,
  adminRefreshTokenRequestSchema,
  adminTransferTokenRequestSchema,
} from "../../../../validators/admin-auth-validators/index.js";
import { hashRefreshToken } from "./_services/issue-admin-tokens/index.js";
import { loginAdmin } from "./_services/login-admin/index.js";
import { refreshAdminTokens } from "./_services/refresh-admin-tokens/index.js";

const router = Router();

router.post("/login", async (req, res) => {
  res.json(generateCommonRes(await loginAdmin(req, parseRequest(adminLoginRequestSchema, req.body))));
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = parseRequest(adminRefreshTokenRequestSchema, req.body);
  res.json(generateCommonRes(await refreshAdminTokens(req, refreshToken)));
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = parseRequest(adminRefreshTokenRequestSchema, req.body);
  await appDataSource.getRepository(AdminRefreshTokenEntity).delete({ tokenHash: hashRefreshToken(refreshToken) });
  res.status(204).end();
});

// admin-web proxy.ts 가 페이지 진입마다 호출한다. 차단이면 403 과 차단 화면용 정보를 돌려준다.
router.get("/access-check", adminAuthMiddleware, accessPolicyMiddleware, (_, res) => {
  res.json(generateCommonRes({ isAllowed: true }));
});

router.get("/me", adminAuthMiddleware, accessPolicyMiddleware, (req, res) => {
  const { account, permissionGroup, accessPolicyGroup, permissionCodes } = readAdmin(req);
  const body: ResBody<typeof ADMIN_ME_API>["data"] = {
    id: account.id,
    loginId: account.loginId,
    nickname: account.nickname,
    permissionGroupName: permissionGroup.name,
    accessPolicyGroupName: accessPolicyGroup.name,
    permissionCodes: [...permissionCodes],
  };
  res.json(generateCommonRes(body));
});

/** transfer token 으로 할 동작에 필요한 권한. 실제 업로드 · 다운로드 요청에서도 다시 확인한다. */
const TRANSFER_PERMISSION_CODES: Record<AdminTransferTarget["purpose"], PermissionCode> = {
  UPLOAD_DOCUMENT: "file.list.create",
  UPLOAD_DOCUMENT_VERSION: "file.detail.version.create",
  DOWNLOAD_DOCUMENT_VERSION: "file.detail.access",
};

// 브라우저가 api 를 직접 호출하는 업로드 · 다운로드용 단기 토큰. 지정한 동작 · 대상에만 쓸 수 있다.
router.post("/transfer-token", adminAuthMiddleware, accessPolicyMiddleware, async (req, res) => {
  const target = parseRequest(adminTransferTokenRequestSchema, req.body);
  const { account, permissionCodes } = readAdmin(req);
  if (!permissionCodes.has(TRANSFER_PERMISSION_CODES[target.purpose])) {
    throw new HttpError(403, API_ERROR_CODE.PERMISSION_DENIED, "이 기능을 사용할 권한이 없습니다.");
  }
  const body: ResBody<typeof ADMIN_TRANSFER_TOKEN_API>["data"] = {
    transferToken: await signAdminTransferToken({ adminAccountId: account.id, target, secret: apiEnv.jwtSecret }),
    expiresAt: new Date(Date.now() + ADMIN_TRANSFER_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString(),
  };
  res.json(generateCommonRes(body));
});

export const authRouter = router;
