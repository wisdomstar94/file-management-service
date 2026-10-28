import type { ApiSuccessBody } from "@fms/common-utils/responses/api-response-body";

/** 성공 응답 본문을 `{ data }` 공통 규격으로 감싼다. */
export function generateCommonRes<TData>(data: TData): ApiSuccessBody<TData> {
  return { data };
}
