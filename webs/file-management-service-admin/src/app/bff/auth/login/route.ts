import type { AdminTokenResponse } from "@fms/api-schemas/responses/admin-auth-responses";
import type { ApiResponseBody, ApiSuccessBody } from "@fms/common-utils/responses/api-response-body";
import { type NextRequest, NextResponse } from "next/server";
import { writeAdminTokenCookies } from "@/utils/admin-auth-cookies";
import { buildApiForwardHeaders } from "@/utils/build-api-forward-headers";
import { webEnv } from "@/utils/web-env";

/** 로그인 성공 시 토큰은 httpOnly 쿠키로만 저장하고 브라우저에는 돌려주지 않는다. */
export async function POST(request: NextRequest) {
  const headers = buildApiForwardHeaders(request.headers);
  headers.set("content-type", "application/json");
  const apiResponse = await fetch(`${webEnv.apiInternalUrl}/api/admin/auth/login`, {
    method: "POST",
    headers,
    body: await request.text(),
    cache: "no-store",
  });
  const body = (await apiResponse.json()) as ApiResponseBody<AdminTokenResponse>;
  if (body.error) {
    return NextResponse.json(body, { status: apiResponse.status });
  }

  const responseBody: ApiSuccessBody<{ isLoggedIn: true }> = { data: { isLoggedIn: true } };
  const response = NextResponse.json(responseBody);
  writeAdminTokenCookies(response.cookies, body.data);
  return response;
}
