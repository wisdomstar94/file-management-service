import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { Response } from "express";
import type { HttpError } from "#/classes/http-error/index.js";
import { apiEnv } from "#/consts/api-env/index.js";

/**
 * 받을 수 없으면 브라우저가 이동해 온 주소라 JSON 대신 공개 링크 화면으로 돌려보낸다.
 * 잠금 해제가 만료된 것이면 화면이 비밀번호 입력을 띄우면 충분하고, 그 외에는 실패 사유와 시각을 쿼리로 넘긴다.
 */
export function redirectToShareLinkPage(res: Response, shareLinkKey: string, error: HttpError) {
  const url = new URL(`/s/${encodeURIComponent(shareLinkKey)}`, apiEnv.userWebOrigin);
  if (error.code !== API_ERROR_CODE.UNAUTHORIZED) {
    url.searchParams.set("downloadError", error.code);
    url.searchParams.set("timestamp", String(Date.now()));
  }
  res.redirect(303, url.toString());
}
