import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { ApiFailBody } from "@fms/common-utils/responses/api-response-body";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, writeAdminTokenCookies } from "@/utils/admin-auth-cookies";
import { buildApiForwardHeaders } from "@/utils/build-api-forward-headers";
import { resolveAdminAccessToken } from "@/utils/resolve-admin-access-token";
import { webEnv } from "@/utils/web-env";

const PASS_RESPONSE_HEADERS = ["content-type", "content-disposition", "content-length"];

// 토큰을 돌려주는 인증 API 는 브라우저로 노출하지 않는다. 로그인 · 로그아웃은 전용 라우트를 쓴다.
const isBlockedPath = (path: string[]) => path[0] === "auth" && path[1] !== "me";

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (isBlockedPath(path)) {
    const body: ApiFailBody = { error: { code: API_ERROR_CODE.NOT_FOUND, message: "없는 경로입니다." } };
    return NextResponse.json(body, { status: 404 });
  }

  const cookieStore = await cookies();
  const { accessToken, refreshed } = await resolveAdminAccessToken({
    incoming: request.headers,
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
  });
  if (!accessToken) {
    const body: ApiFailBody = { error: { code: API_ERROR_CODE.UNAUTHORIZED, message: "로그인이 필요합니다." } };
    return NextResponse.json(body, { status: 401 });
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const apiResponse = await fetch(`${webEnv.apiInternalUrl}/api/admin/${path.join("/")}${request.nextUrl.search}`, {
    method: request.method,
    headers: buildApiForwardHeaders(request.headers, accessToken),
    body: hasBody ? request.body : undefined,
    // 업로드 파일을 버퍼링하지 않고 api 로 흘려보낸다.
    duplex: hasBody ? "half" : undefined,
    cache: "no-store",
  } as RequestInit);

  const headers = new Headers();
  for (const name of PASS_RESPONSE_HEADERS) {
    const value = apiResponse.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  const response = new NextResponse(apiResponse.status === 204 ? null : apiResponse.body, {
    status: apiResponse.status,
    headers,
  });
  if (refreshed) {
    writeAdminTokenCookies(response.cookies, refreshed);
  }
  return response;
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST };
