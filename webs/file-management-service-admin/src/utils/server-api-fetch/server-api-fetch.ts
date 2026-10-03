import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { ApiResponseBody } from "@fms/common-utils/responses/api-response-body";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE } from "../admin-auth-cookies";
import { buildApiForwardHeaders } from "../build-api-forward-headers";
import { webEnv } from "../web-env";

/**
 * 서버 컴포넌트에서 api 를 호출한다. 인증 · 접근 정책 · 권한 오류는 해당 화면으로 보내고, 404 는 not-found 로 보낸다.
 */
export async function serverApiFetch<T>(path: string): Promise<T> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  const res = await fetch(`${webEnv.apiInternalUrl}${path}`, {
    headers: buildApiForwardHeaders(await headers(), token),
    cache: "no-store",
  });
  const responseBody = (await res.json().catch(() => null)) as ApiResponseBody<T> | null;
  if (res.ok && responseBody && !responseBody.error) {
    return responseBody.data;
  }

  const body = responseBody?.error ?? null;
  if (res.status === 401) {
    redirect("/login");
  }
  if (body?.code === API_ERROR_CODE.ACCESS_POLICY_DENIED) {
    redirect("/access-denied");
  }
  if (body?.code === API_ERROR_CODE.PERMISSION_DENIED) {
    redirect("/forbidden");
  }
  if (res.status === 404) {
    notFound();
  }
  throw new Error(`api 호출 실패 (${res.status}) ${path} : ${body?.message ?? ""}`);
}
