import type { SHARE_LINK_LIST_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import { readShareLinkAvailability } from "#/utils/read-share-link-availability/index.js";
import { resolveDefaultVersion } from "#/utils/resolve-default-version/index.js";
import type { DocumentWithVersions } from "../../../_services/find-document-or-throw/index.js";

export function toShareLinkResponse(
  link: ShareLinkEntity,
  document: DocumentWithVersions,
): ResBody<typeof SHARE_LINK_LIST_API>["data"][number] {
  const fixedVersion = document.versions.find((version) => version.id === link.fixedVersionId) ?? null;
  const effective =
    link.defaultVersionMode === "FIXED" && fixedVersion
      ? fixedVersion
      : resolveDefaultVersion(document.versions, document.defaultVersionId);

  return {
    id: link.id,
    shareLinkKey: link.shareLinkKey,
    accessPolicyGroup: link.accessPolicyGroup
      ? { id: link.accessPolicyGroup.id, name: link.accessPolicyGroup.name }
      : null,
    hasPassword: link.passwordHash !== null,
    downloadCount: link.downloadCount,
    maxDownloadCount: link.maxDownloadCount,
    availableFrom: link.availableFrom?.toISOString() ?? null,
    availableUntil: link.availableUntil?.toISOString() ?? null,
    defaultVersionMode: link.defaultVersionMode,
    fixedVersion: fixedVersion ? { id: fixedVersion.id, versionName: fixedVersion.versionName } : null,
    effectiveDefaultVersion: { id: effective.id, versionName: effective.versionName },
    isShowOtherVersions: link.isShowOtherVersions,
    isAllowOtherVersionDownload: link.isAllowOtherVersionDownload,
    isShowDownloadStatus: link.isShowDownloadStatus,
    availability: readShareLinkAvailability(link),
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
  };
}
