import type { ApiSuccessBody } from "@fms/common-utils/responses/api-response-body";
import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";

type AdminToken = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export const ADMIN_LOGIN_API = {
  url: "/api/admin/auth/login",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ loginId: string; password: string }>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<AdminToken>>(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;

export const ADMIN_REFRESH_TOKEN_API = {
  url: "/api/admin/auth/refresh",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ refreshToken: string }>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<AdminToken>>(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;

export const ADMIN_LOGOUT_API = {
  url: "/api/admin/auth/logout",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<{ refreshToken: string }>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<null>(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;

export const ADMIN_ACCESS_CHECK_API = {
  url: "/api/admin/auth/access-check",
  method: "GET",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ isAllowed: true }>>(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;

export const ADMIN_ME_API = {
  url: "/api/admin/auth/me",
  method: "GET",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response:
    typeOf<
      ApiSuccessBody<{
        id: string;
        loginId: string;
        nickname: string;
        permissionGroupName: string;
        accessPolicyGroupName: string;
        permissionCodes: string[];
      }>
    >(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;

/** 브라우저가 api 를 직접 호출하는 업로드 · 다운로드용 단기 토큰을 받는다. 토큰은 지정한 동작 · 대상에만 쓸 수 있다. */
export const ADMIN_TRANSFER_TOKEN_API = {
  url: "/api/admin/auth/transfer-token",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<
      | { purpose: "UPLOAD_DOCUMENT" }
      | { purpose: "UPLOAD_DOCUMENT_VERSION"; documentId: string }
      | { purpose: "DOWNLOAD_DOCUMENT_VERSION"; documentId: string; versionId: string }
    >(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<{ transferToken: string; expiresAt: string }>>(),
  tags: ["admin-auth"],
} as const satisfies ApiSchema;
