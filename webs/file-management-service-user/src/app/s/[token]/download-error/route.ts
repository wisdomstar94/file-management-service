import { type NextRequest, NextResponse } from "next/server";
import { readDownloadErrorCookieName, readDownloadErrorCookiePath } from "@/utils/share-link-download-error-cookie";

/** 화면에 띄운 다운로드 실패 사유를 지운다. 서버 컴포넌트는 쿠키를 지울 수 없어 화면이 이 경로를 부른다. */
export async function DELETE(_request: NextRequest, context: RouteContext<"/s/[token]/download-error">) {
  const { token } = await context.params;
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete({ name: readDownloadErrorCookieName(token), path: readDownloadErrorCookiePath(token) });
  return response;
}
