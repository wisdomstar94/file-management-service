import type { DOCUMENT_DETAIL_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { findLatestVersion, resolveDefaultVersion } from "#/utils/resolve-default-version/index.js";
import type { DocumentWithVersions } from "../../_services/find-document-or-throw/index.js";
import { toDocumentVersionResponse } from "../to-document-version-response/index.js";

export function toDocumentDetailResponse(document: DocumentWithVersions): ResBody<typeof DOCUMENT_DETAIL_API>["data"] {
  const latest = findLatestVersion(document.versions);
  const ids = {
    latestVersionId: latest.id,
    defaultVersionId: resolveDefaultVersion(document.versions, document.defaultVersionId).id,
  };
  return {
    id: document.id,
    name: document.name,
    defaultVersionId: document.defaultVersionId,
    latestVersion: toDocumentVersionResponse(latest, ids),
    versions: document.versions.map((version) => toDocumentVersionResponse(version, ids)),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}
