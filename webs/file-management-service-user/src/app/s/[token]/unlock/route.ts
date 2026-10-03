import type { PublicShareLinkUnlockResponse } from "@fms/api-schemas/responses/share-link-responses";
import type { ApiResponseBody, ApiSuccessBody } from "@fms/common-utils/responses/api-response-body";
import { type NextRequest, NextResponse } from "next/server";
import { publicApiFetch } from "@/utils/public-api-fetch";
import { readUnlockCookieName, readUnlockCookiePath } from "@/utils/share-link-unlock-cookie";
import { webEnv } from "@/utils/web-env";

/** 비밀번호가 맞으면 잠금 해제 토큰을 그 링크 경로 한정 httpOnly 쿠키로 저장한다. */
export async function POST(request: NextRequest, context: RouteContext<"/s/[token]/unlock">) {
  const { token } = await context.params;
  const apiResponse = await publicApiFetch(token, "/unlock", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: await request.text(),
  });
  const body = (await apiResponse.json()) as ApiResponseBody<PublicShareLinkUnlockResponse>;
  if (body.error) {
    return NextResponse.json(body, { status: apiResponse.status });
  }

  const { unlockToken, expiresAt } = body.data;
  const responseBody: ApiSuccessBody<{ isUnlocked: true }> = { data: { isUnlocked: true } };
  const response = NextResponse.json(responseBody);
  response.cookies.set(readUnlockCookieName(token), unlockToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: webEnv.isSecureCookie,
    path: readUnlockCookiePath(token),
    expires: new Date(expiresAt),
  });
  return response;
}
