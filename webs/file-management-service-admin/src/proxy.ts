import { ADMIN_ACCESS_CHECK_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
} from "@fms/common-utils/cookies/admin-auth-cookie-names";
import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { type NextRequest, NextResponse } from "next/server";
import { clearAdminTokenCookies, writeAdminTokenCookies } from "./utils/admin-auth-cookies";
import { readRouteGroup } from "./utils/read-route-group";
import { resolveAdminAccessToken } from "./utils/resolve-admin-access-token";
import { fetchServerWrapper } from "./wrappers/fetch-server-wrapper";

async function checkAccessPolicy(request: NextRequest, accessToken: string) {
  try {
    await fetchServerWrapper(
      ADMIN_ACCESS_CHECK_API,
      {},
      { incoming: request.headers, accessToken, redirectOnAuthError: false, redirectOnPageError: false },
    );
    return "ALLOWED" as const;
  } catch (error) {
    const isDenied = isCommonError(error) && error.errorCode === API_ERROR_CODE.ACCESS_POLICY_DENIED;
    return isDenied ? ("DENIED" as const) : ("UNAUTHORIZED" as const);
  }
}

/** 새로 받은 토큰을 이번 요청의 서버 컴포넌트도 읽을 수 있게 요청 쿠키에도 반영한다. */
function nextWithAccessToken(request: NextRequest, accessToken: string) {
  request.cookies.set(ADMIN_ACCESS_TOKEN_COOKIE, accessToken);
  return NextResponse.next({ request: { headers: request.headers } });
}

export async function proxy(request: NextRequest) {
  const routeGroup = readRouteGroup(request.nextUrl.pathname);
  if (routeGroup === "public") {
    return NextResponse.next();
  }

  const { accessToken, refreshed } = await resolveAdminAccessToken({
    incoming: request.headers,
    accessToken: request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value,
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|jpg|webp)$).*)"],
};
