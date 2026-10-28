"use server";

import { ADMIN_ME_API, ADMIN_SHORT_TIME_TOKEN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import type { ApiRequest, ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { CommonError } from "@fms/error-provider/errors/common-error";
import { createOtherCommonError } from "../_utils/create-common-error";
import { fetchServerWrapper } from "../fetch-server-wrapper";
import { serverActionWrapper } from "../server-action-wrapper";

// 토큰을 주고받거나(refresh) api 가 쿠키를 심는(login · logout) 인증 api 는 서버 액션으로 대신 호출하지 않는다.
const ALLOWED_AUTH_URLS: string[] = [ADMIN_ME_API.url, ADMIN_SHORT_TIME_TOKEN_API.url];

/** 브라우저가 넘긴 schema 라 그대로 믿지 않는다. admin api 경로 · json 응답 · 헤더 없음만 허용한다. */
function assertCallableSchema(schema: ApiSchema, request: { headers?: unknown }) {
  const isAdminApi = schema.url.startsWith("/api/admin/") && !schema.url.includes("..");
  const isBlockedAuthApi = schema.url.startsWith("/api/admin/auth/") && !ALLOWED_AUTH_URLS.includes(schema.url);
  if (!isAdminApi || isBlockedAuthApi || schema.responseType === "stream" || request.headers !== undefined) {
    throw createOtherCommonError({
      message: `서버 액션으로 호출할 수 없는 api 입니다. (${schema.method} ${schema.url})`,
    });
  }
}

/** 클라이언트 컴포넌트가 api schema 로 api 를 호출하는 서버 액션. 토큰은 서버에서만 붙인다. */
export async function callApiActionWrapper<S extends ApiSchema>(
  schema: S,
  request: ApiRequest<S>,
): Promise<ResBody<S> | CommonError> {
  return serverActionWrapper(async () => {
    assertCallableSchema(schema, request);
    // 권한 없음 · 404 는 화면 이동 대신 호출한 쪽이 메시지로 보여준다.
    return fetchServerWrapper(schema, request, { redirectOnPageError: false });
  })();
}
