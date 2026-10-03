import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { ApiFailBody } from "@fms/common-utils/responses/api-response-body";
import { type NextRequest, NextResponse } from "next/server";
import { readRouteGroup } from "./consts/route-group-paths";
import {
  ACCESS_TOKEN_COOKIE,
  clearAdminTokenCookies,
  REFRESH_TOKEN_COOKIE,
  writeAdminTokenCookies,
} from "./utils/admin-auth-cookies";
import { buildApiForwardHeaders } from "./utils/build-api-forward-headers";
import { resolveAdminAccessToken } from "./utils/resolve-admin-access-token";
import { webEnv } from "./utils/web-env";

async function checkAccessPolicy(request: NextRequest, accessToken: string) {
  const res = await fetch(`${webEnv.apiInternalUrl}/api/admin/auth/access-check`, {
    headers: buildApiForwardHeaders(request.headers, accessToken),
    cache: "no-store",
  });
  if (res.ok) {
    return "ALLOWED" as const;
  }
  const body = (await res.json().catch(() => null)) as ApiFailBody | null;
  return body?.error.code === API_ERROR_CODE.ACCESS_POLICY_DENIED ? ("DENIED" as const) : ("UNAUTHORIZED" as const);
}

/** 새로 받은 토큰을 이번 요청의 서버 컴포넌트도 읽을 수 있게 요청 쿠키에도 반영한다. */
function nextWithAccessToken(request: NextRequest, accessToken: string) {
  request.cookies.set(ACCESS_TOKEN_COOKIE, accessToken);
  return NextResponse.next({ request: { headers: request.headers } });
}

export async function proxy(request: NextRequest) {
  const routeGroup = readRouteGroup(request.nextUrl.pathname);
  if (routeGroup === "public") {
    return NextResponse.next();
  }

  const { accessToken, refreshed } = await resolveAdminAccessToken({
    incoming: request.headers,
    accessToken: request.cookies.get(ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
  });
  const withCookies = (response: NextResponse) => {
    if (refreshed) {
      writeAdminTokenCookies(response.cookies, refreshed);
    }
    return response;
  };

  if (routeGroup === "guest-only") {
    return accessToken ? withCookies(NextResponse.redirect(new URL("/documents", request.url))) : NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    const response = NextResponse.redirect(loginUrl);
    clearAdminTokenCookies(response.cookies);
    return response;
  }

  const result = await checkAccessPolicy(request, accessToken);
  if (result === "DENIED") {
    return withCookies(NextResponse.rewrite(new URL("/access-denied", request.url)));
  }
  if (result === "UNAUTHORIZED") {
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearAdminTokenCookies(response.cookies);
    return response;
  }
  return withCookies(nextWithAccessToken(request, accessToken));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|bff|favicon.ico|.*\\.(?:png|svg|ico|jpg|webp)$).*)"],
};
