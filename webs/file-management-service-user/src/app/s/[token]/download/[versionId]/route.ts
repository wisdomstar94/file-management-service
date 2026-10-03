import type { ApiFailBody } from "@fms/common-utils/responses/api-response-body";
import { type NextRequest, NextResponse } from "next/server";
import { publicApiFetch } from "@/utils/public-api-fetch";
import { readDownloadErrorCookieName, readDownloadErrorCookiePath } from "@/utils/share-link-download-error-cookie";
import { webEnv } from "@/utils/web-env";

const PASS_RESPONSE_HEADERS = ["content-type", "content-disposition", "content-length"];

/** api 의 파일 응답을 그대로 흘려보낸다. 받을 수 없으면 링크 화면으로 돌려보내 이유를 보여준다. */
export async function GET(_request: NextRequest, context: RouteContext<"/s/[token]/download/[versionId]">) {
  const { token, versionId } = await context.params;
  const apiResponse = await publicApiFetch(token, `/versions/${encodeURIComponent(versionId)}/download`);
  if (!apiResponse.ok) {
    // standalone 서버의 nextUrl 은 요청 Host 가 아니라 바인드 주소(0.0.0.0)를 담아, 상대경로로 돌려보낸다.
    const response = new NextResponse(null, { status: 303, headers: { location: `/s/${token}` } });
    // 잠금 해제가 만료된 것이라 링크 화면이 비밀번호 입력을 띄우면 충분하다.
    if (apiResponse.status === 401) {
      return response;
    }
    const body = (await apiResponse.json().catch(() => null)) as ApiFailBody | null;
    response.cookies.set(readDownloadErrorCookieName(token), body?.error.code ?? "UNKNOWN", {
      httpOnly: true,
      sameSite: "lax",
      secure: webEnv.isSecureCookie,
      path: readDownloadErrorCookiePath(token),
      maxAge: webEnv.shareDownloadErrorCookieMaxAgeSeconds,
    });
    return response;
  }

  const headers = new Headers();
  for (const name of PASS_RESPONSE_HEADERS) {
    const value = apiResponse.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  return new NextResponse(apiResponse.body, { status: 200, headers });
}
