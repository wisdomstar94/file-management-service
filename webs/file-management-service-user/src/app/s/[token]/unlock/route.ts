import { PUBLIC_SHARE_LINK_UNLOCK_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { type NextRequest, NextResponse } from "next/server";
import type { SHARE_LINK_UNLOCK_ROUTE } from "@/api-schemas/share-link-route-schemas";
import { readUnlockCookieName, readUnlockCookiePath } from "@/utils/share-link-unlock-cookie";
import { webEnv } from "@/utils/web-env";
import { createOtherCommonError, DEFAULT_ERROR_MESSAGE } from "@/wrappers/_utils/create-common-error";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";

/** 비밀번호가 맞으면 잠금 해제 토큰을 그 링크 경로 한정 httpOnly 쿠키로 저장한다. 실패하면 api 에러 응답 본문 또는 `CommonError` 를 돌려준다. */
export async function POST(request: NextRequest, context: RouteContext<"/s/[token]/unlock">) {
  const { token } = await context.params;
  try {
    const { unlockToken, expiresAt } = (
      await fetchServerWrapper(PUBLIC_SHARE_LINK_UNLOCK_API, { params: { token }, body: await request.json() })
    ).data;
    const responseBody: ResBody<typeof SHARE_LINK_UNLOCK_ROUTE> = { data: { isUnlocked: true } };
    const response = NextResponse.json(responseBody);
    response.cookies.set(readUnlockCookieName(token), unlockToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: webEnv.isSecureCookie,
      path: readUnlockCookiePath(token),
      expires: new Date(expiresAt),
    });
    return response;
  } catch (error) {
    // api 에러 응답은 화면이 메시지를 읽을 수 있게 api 응답 본문을 그대로 돌려준다.
    if (isCommonError(error) && error.apiError) {
      return NextResponse.json(error.apiError.resPayload, { status: 400 });
    }
    const commonError = createOtherCommonError({ message: DEFAULT_ERROR_MESSAGE });
    console.error(`[${commonError.errorCode}] unlock route`, error);
    return NextResponse.json(commonError, { status: 500 });
  }
}
