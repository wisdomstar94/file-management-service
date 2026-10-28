import type {
  ADMIN_LOGIN_API,
  ADMIN_ME_API,
  ADMIN_SHORT_TIME_TOKEN_API,
} from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { ADMIN_REFRESH_TOKEN_COOKIE } from "@fms/consts/cookies/admin-auth-cookie-names";
import { API_ERROR_CODE } from "@fms/consts/errors/api-error-code";
import { AdminRefreshTokenEntity } from "@fms/database-entities/entities/admin-refresh-token-entity";
import { ADMIN_SHORT_TIME_TOKEN_EXPIRES_IN_SECONDS } from "@fms/jwt-handler/consts/admin-short-time-token-expires-in-seconds";
import { signAdminShortTimeToken } from "@fms/jwt-handler/tokens/admin-short-time-token";
import { Router } from "express";
import { HttpError } from "#/classes/http-error/index.js";
import { apiEnv } from "#/consts/api-env/index.js";
import { accessPolicyMiddleware } from "#/middlewares/access-policy-middleware/index.js";
import { adminAuthMiddleware } from "#/middlewares/admin-auth-middleware/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { generateCommonRes } from "#/utils/commons/generate-common-res/index.js";
import { parseRequest } from "#/utils/commons/parse-request/index.js";
import { readCookie } from "#/utils/commons/read-cookie/index.js";
import { readAdmin } from "#/utils/domains/admin-auth/read-admin/index.js";
import {
  adminLoginRequestSchema,
  adminRefreshTokenRequestSchema,
  adminShortTimeTokenRequestSchema,
} from "#/validators/admin-auth-validators/index.js";
import { SHORT_TIME_TOKEN_PERMISSION_CODES } from "./_consts/short-time-token-permission-codes/index.js";
import { loginAdmin } from "./_services/login-admin/index.js";
import { refreshAdminTokens } from "./_services/refresh-admin-tokens/index.js";
import { clearAdminTokenCookies } from "./_utils/domains/admin-auth-cookie/clear-admin-token-cookies/index.js";
import { writeAdminTokenCookies } from "./_utils/domains/admin-auth-cookie/write-admin-token-cookies/index.js";
import { hashRefreshToken } from "./_utils/hash-refresh-token/index.js";

const router = Router();

// 토큰은 httpOnly 쿠키로만 내려주고 브라우저 스크립트에는 돌려주지 않는다.
router.post("/login", async (req, res) => {
  writeAdminTokenCookies(res, await loginAdmin(req, parseRequest(adminLoginRequestSchema, req.body)));
  const body: ResBody<typeof ADMIN_LOGIN_API>["data"] = { isLoggedIn: true };
  res.json(generateCommonRes(body));
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = parseRequest(adminRefreshTokenRequestSchema, req.body);
  res.json(generateCommonRes(await refreshAdminTokens(req, refreshToken)));
});

// 쿠키에 refresh token 이 없어도 쿠키는 지운다.
router.post("/logout", async (req, res) => {
  const refreshToken = readCookie(req, ADMIN_REFRESH_TOKEN_COOKIE);
  if (refreshToken) {
    await appDataSource.getRepository(AdminRefreshTokenEntity).delete({ tokenHash: hashRefreshToken(refreshToken) });
  }
  clearAdminTokenCookies(res);
  res.status(204).end();
});

// 관리자 웹이 로그인 후 페이지에 들어올 때(proxy.ts)와 차단 화면을 그릴 때 호출한다. 차단이면 403 과 차단 화면용 정보를 돌려준다.
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

// 브라우저가 api 를 직접 호출하는 업로드 · 다운로드용 단기 토큰. 지정한 동작 · 대상에만 쓸 수 있다.
router.post("/short-time-token", adminAuthMiddleware, accessPolicyMiddleware, async (req, res) => {
  const target = parseRequest(adminShortTimeTokenRequestSchema, req.body);
  const { account, permissionCodes } = readAdmin(req);
  if (!permissionCodes.has(SHORT_TIME_TOKEN_PERMISSION_CODES[target.purpose])) {
    throw new HttpError(403, API_ERROR_CODE.PERMISSION_DENIED, "이 기능을 사용할 권한이 없습니다.");
  }
  const body: ResBody<typeof ADMIN_SHORT_TIME_TOKEN_API>["data"] = {
    shortTimeToken: await signAdminShortTimeToken({
      adminAccountId: account.id,
      target,
      secret: apiEnv.adminShortTimeTokenSecret,
    }),
    expiresAt: new Date(Date.now() + ADMIN_SHORT_TIME_TOKEN_EXPIRES_IN_SECONDS * 1000).toISOString(),
  };
  res.json(generateCommonRes(body));
});

export const authRouter = router;
