"use server";

import type { ApiSchema } from "@fms/api-schemas/types/api-schema";
import type { ApiRequest, ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { CommonError } from "@fms/error-provider/errors/common-error";
import { createOtherCommonError } from "../_utils/create-common-error";
import { fetchServerWrapper } from "../fetch-server-wrapper";
import { serverActionWrapper } from "../server-action-wrapper";

/** 브라우저가 넘긴 schema 라 그대로 믿지 않는다. 공개 api 경로 · json 응답 · 헤더 없음만 허용한다. */
function assertCallableSchema(schema: ApiSchema, request: { headers?: unknown }) {
  const isPublicApi = schema.url.startsWith("/api/public/") && !schema.url.includes("..");
  if (!isPublicApi || schema.responseType === "stream" || request.headers !== undefined) {
    throw createOtherCommonError({
      message: `서버 액션으로 호출할 수 없는 api 입니다. (${schema.method} ${schema.url})`,
    });
  }
}

/** 클라이언트 컴포넌트가 api schema 로 공개 api 를 호출하는 서버 액션 */
export async function callApiActionWrapper<S extends ApiSchema>(
  schema: S,
  request: ApiRequest<S>,
): Promise<ResBody<S> | CommonError> {
  return serverActionWrapper(async () => {
    assertCallableSchema(schema, request);
    return fetchServerWrapper(schema, request);
  })();
}
