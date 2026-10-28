import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { Request } from "express";
import { HttpError } from "#/classes/http-error/index.js";
import { readShareLinkUnlockCookie } from "../../_utils/domains/share-link-unlock-cookie/read-share-link-unlock-cookie/index.js";
import { isShareLinkUnlocked } from "../../_utils/domains/share-link-unlock-token/is-share-link-unlocked/index.js";
import { findOpenShareLinkOrThrow } from "../find-open-share-link-or-throw/index.js";
import { resolveShareLinkDefaultVersion } from "../resolve-share-link-default-version/index.js";

/** 접근 정책 → 비밀번호 순서로 통과해야 자료 정보를 연다. */
export async function findUnlockedShareLinkOrThrow(req: Request) {
  const opened = await findOpenShareLinkOrThrow(req);
  if (!(await isShareLinkUnlocked(opened.link, readShareLinkUnlockCookie(req, opened.link.shareLinkKey)))) {
    throw new HttpError(401, API_ERROR_CODE.UNAUTHORIZED, "비밀번호가 필요합니다.");
  }
  return { ...opened, defaultVersion: resolveShareLinkDefaultVersion(opened.link, opened.document, opened.versions) };
}
