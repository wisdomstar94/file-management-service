import type {
  PUBLIC_SHARE_LINK_DETAIL_API,
  PUBLIC_SHARE_LINK_GATE_API,
  PUBLIC_SHARE_LINK_UNLOCK_API,
} from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import { verifyPassword } from "@fms/password-handler/passwords/verify-password";
import { type Request, type Response, Router } from "express";
import { HttpError } from "#/classes/http-error/index.js";
import { apiEnv } from "#/consts/api-env/index.js";
import { generateCommonRes } from "#/utils/generate-common-res/index.js";
import { notFoundError } from "#/utils/not-found-error/index.js";
import { parseRequest } from "#/utils/parse-request/index.js";
import { readAccessPolicyRequest } from "#/utils/read-access-policy-request/index.js";
import { readShareLinkAvailability } from "#/utils/read-share-link-availability/index.js";
import { readUuidParam } from "#/utils/read-uuid-param/index.js";
import { sendVersionFile } from "#/utils/send-version-file/index.js";
import { unlockShareLinkRequestSchema } from "#/validators/share-link-validators/index.js";
import { consumeDownload } from "./_services/consume-download/index.js";
import { findOpenShareLinkOrThrow } from "./_services/find-open-share-link-or-throw/index.js";
import { resolveShareLinkDefaultVersion } from "./_services/resolve-share-link-default-version/index.js";
import { readShareLinkUnlockCookie, writeShareLinkUnlockCookie } from "./_utils/share-link-unlock-cookie/index.js";
import { isShareLinkUnlocked, signShareLinkUnlockToken } from "./_utils/share-link-unlock-token/index.js";

const router = Router();

const toPublicVersion = (
  version: DocumentVersionEntity,
): ResBody<typeof PUBLIC_SHARE_LINK_DETAIL_API>["data"]["defaultVersion"] => ({
  id: version.id,
  versionName: version.versionName,
  fileName: version.fileName,
  fileSize: version.fileSize,
});

/** 접근 정책 → 비밀번호 순서로 통과해야 자료 정보를 연다. */
async function findUnlockedShareLinkOrThrow(req: Request) {
  const opened = await findOpenShareLinkOrThrow(req);
  if (!(await isShareLinkUnlocked(opened.link, readShareLinkUnlockCookie(req, opened.link.shareLinkKey)))) {
    throw new HttpError(401, API_ERROR_CODE.UNAUTHORIZED, "비밀번호가 필요합니다.");
  }
  return { ...opened, defaultVersion: resolveShareLinkDefaultVersion(opened.link, opened.document, opened.versions) };
}

router.get("/:shareLinkKey", async (req, res) => {
  const { link } = await findOpenShareLinkOrThrow(req);
  const body: ResBody<typeof PUBLIC_SHARE_LINK_GATE_API>["data"] = {
    state: link.passwordHash === null ? "OPEN" : "PASSWORD_REQUIRED",
  };
  res.json(generateCommonRes(body));
});

router.post("/:shareLinkKey/unlock", async (req, res) => {
  const { password } = parseRequest(unlockShareLinkRequestSchema, req.body);
  const { link } = await findOpenShareLinkOrThrow(req);
  const isValid = link.passwordHash !== null && (await verifyPassword(link.passwordHash, password));
  if (!isValid) {
    throw new HttpError(401, API_ERROR_CODE.INVALID_CREDENTIALS, "비밀번호가 올바르지 않습니다.");
  }
  const expiresAt = new Date(Date.now() + apiEnv.shareLinkUnlockExpiresInSeconds * 1000);
  writeShareLinkUnlockCookie(res, {
    shareLinkKey: link.shareLinkKey,
    unlockToken: await signShareLinkUnlockToken(link),
    expiresAt,
  });
  const body: ResBody<typeof PUBLIC_SHARE_LINK_UNLOCK_API>["data"] = { expiresAt: expiresAt.toISOString() };
  res.json(generateCommonRes(body));
});

router.get("/:shareLinkKey/detail", async (req, res) => {
  const { link, document, versions, defaultVersion } = await findUnlockedShareLinkOrThrow(req);
  const body: ResBody<typeof PUBLIC_SHARE_LINK_DETAIL_API>["data"] = {
    documentName: document.name,
    defaultVersion: toPublicVersion(defaultVersion),
    otherVersions: link.isShowOtherVersions
      ? versions.filter((version) => version.id !== defaultVersion.id).map(toPublicVersion)
      : null,
    isAllowOtherVersionDownload: link.isShowOtherVersions && link.isAllowOtherVersionDownload,
    downloadStatus: link.isShowDownloadStatus
      ? { downloadCount: link.downloadCount, maxDownloadCount: link.maxDownloadCount }
      : null,
    availableFrom: link.availableFrom?.toISOString() ?? null,
    availableUntil: link.availableUntil?.toISOString() ?? null,
    availability: readShareLinkAvailability(link),
  };
  res.json(generateCommonRes(body));
});

/**
 * 받을 수 없으면 브라우저가 이동해 온 주소라 JSON 대신 공개 링크 화면으로 돌려보낸다.
 * 잠금 해제가 만료된 것이면 화면이 비밀번호 입력을 띄우면 충분하고, 그 외에는 실패 사유와 시각을 쿼리로 넘긴다.
 */
function redirectToShareLinkPage(res: Response, shareLinkKey: string, error: HttpError) {
  const url = new URL(`/s/${encodeURIComponent(shareLinkKey)}`, apiEnv.userWebOrigin);
  if (error.code !== API_ERROR_CODE.UNAUTHORIZED) {
    url.searchParams.set("downloadError", error.code);
    url.searchParams.set("timestamp", String(Date.now()));
  }
  res.redirect(303, url.toString());
}

router.get("/:shareLinkKey/versions/:versionId/download", async (req, res) => {
  try {
    const { link, versions, defaultVersion } = await findUnlockedShareLinkOrThrow(req);
    const versionId = readUuidParam(req, "versionId");
    const version = versions.find((item) => item.id === versionId);
    const isAllowedVersion =
      version?.id === defaultVersion.id || (link.isShowOtherVersions && link.isAllowOtherVersionDownload);
    if (!version || !isAllowedVersion) {
      throw notFoundError("버전");
    }

    await consumeDownload({ linkId: link.id, versionId: version.id, ip: readAccessPolicyRequest(req).ip });
    sendVersionFile(res, version);
  } catch (error) {
    if (!(error instanceof HttpError)) {
      throw error;
    }
    redirectToShareLinkPage(res, String(req.params.shareLinkKey), error);
  }
});

export const publicShareLinksRouter = router;
