import { API_ERROR_CODE, type ApiErrorBody } from "@fms/common-utils/errors/api-error-code";
import type { ApiResponseBody } from "@fms/common-utils/responses/api-response-body";

export class BffError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | null,
  ) {
    super(body?.message ?? `요청에 실패했습니다. (${status})`);
  }
}

/** 브라우저 → admin-web BFF(`/bff/**`) → api. 로그인 만료 · 접근 정책 차단이면 해당 화면으로 이동한다. */
export async function bffFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const isJsonBody = init.body !== undefined && !(init.body instanceof FormData);
  const res = await fetch(`/bff/${path.replace(/^\//, "")}`, {
    ...init,
    headers: isJsonBody ? { "content-type": "application/json", ...init.headers } : init.headers,
  });
  // 204 성공도 실패(`useAsyncAction` 의 `undefined`)와 구분되도록 `null` 을 돌려준다.
  if (res.status === 204) {
    return null as T;
  }
  const responseBody = (await res.json().catch(() => null)) as ApiResponseBody<T> | null;
  if (res.ok && responseBody && !responseBody.error) {
    return responseBody.data;
  }

  const body = responseBody?.error ?? null;
  if (res.status === 401) {
    window.location.assign("/login");
  }
  if (body?.code === API_ERROR_CODE.ACCESS_POLICY_DENIED) {
    window.location.assign("/access-denied");
  }
  throw new BffError(res.status, body);
}

/** 400 검증 오류면 필드별 첫 메시지를, 아니면 전체 메시지를 돌려준다. */
export function readBffErrorMessage(error: unknown): string {
  if (!(error instanceof BffError)) {
    return "요청을 처리하지 못했습니다.";
  }
  const issues = (error.body?.details as { issues?: { message: string }[] } | undefined)?.issues;
  return issues?.[0]?.message ?? error.message;
}
