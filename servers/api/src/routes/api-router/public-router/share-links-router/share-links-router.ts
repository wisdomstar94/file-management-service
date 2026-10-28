import type {
  PUBLIC_SHARE_LINK_DETAIL_API,
  PUBLIC_SHARE_LINK_GATE_API,
  PUBLIC_SHARE_LINK_UNLOCK_API,
} from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { verifyPassword } from "@fms/password-handler/passwords/verify-password";
import { Router } from "express";
import { HttpError } from "#/classes/http-error/index.js";
import { apiEnv } from "#/consts/api-env/index.js";
import { generateCommonRes } from "#/utils/commons/generate-common-res/index.js";
import { notFoundError } from "#/utils/commons/not-found-error/index.js";
import { parseRequest } from "#/utils/commons/parse-request/index.js";
import { readUuidParam } from "#/utils/commons/read-uuid-param/index.js";
import { readAccessPolicyRequest } from "#/utils/domains/access-policy/read-access-policy-request/index.js";
import { sendVersionFile } from "#/utils/domains/document-version/send-version-file/index.js";
import { readShareLinkAvailability } from "#/utils/domains/share-link/read-share-link-availability/index.js";
import { unlockShareLinkRequestSchema } from "#/validators/share-link-validators/index.js";
import { consumeDownload } from "./_services/consume-download/index.js";
import { findOpenShareLinkOrThrow } from "./_services/find-open-share-link-or-throw/index.js";
import { findUnlockedShareLinkOrThrow } from "./_services/find-unlocked-share-link-or-throw/index.js";
import { writeShareLinkUnlockCookie } from "./_utils/domains/share-link-unlock-cookie/write-share-link-unlock-cookie/index.js";
import { signShareLinkUnlockToken } from "./_utils/domains/share-link-unlock-token/sign-share-link-unlock-token/index.js";
import { redirectToShareLinkPage } from "./_utils/redirect-to-share-link-page/index.js";
import { toPublicVersion } from "./_utils/to-public-version/index.js";

const router = Router();

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
