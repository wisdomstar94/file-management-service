import {
  adminLoginRequestSchema,
  adminRefreshTokenRequestSchema,
} from "@fms/api-schemas/requests/admin-auth-request-schemas";
import type { AdminMeResponse } from "@fms/api-schemas/responses/admin-auth-responses";
import { AdminRefreshTokenEntity } from "@fms/database-entities/entities/admin-refresh-token-entity";
import { Router } from "express";
import { accessPolicyMiddleware } from "../../../../middlewares/access-policy-middleware/index.js";
import { adminAuthMiddleware } from "../../../../middlewares/admin-auth-middleware/index.js";
import { appDataSource } from "../../../../utils/app-data-source/index.js";
import { generateCommonRes } from "../../../../utils/generate-common-res/index.js";
import { parseRequest } from "../../../../utils/parse-request/index.js";
import { readAdmin } from "../../../../utils/read-admin/index.js";
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
  const body: AdminMeResponse = {
    id: account.id,
    loginId: account.loginId,
    nickname: account.nickname,
    permissionGroupName: permissionGroup.name,
    accessPolicyGroupName: accessPolicyGroup.name,
    permissionCodes: [...permissionCodes],
  };
  res.json(generateCommonRes(body));
});

export const authRouter = router;
