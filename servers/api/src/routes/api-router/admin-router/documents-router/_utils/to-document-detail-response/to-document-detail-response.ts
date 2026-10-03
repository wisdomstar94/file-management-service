import type { DocumentDetailResponse } from "@fms/api-schemas/responses/document-responses";
import { findLatestVersion, resolveDefaultVersion } from "../../../../../../utils/resolve-default-version/index.js";
import type { DocumentWithVersions } from "../../_services/find-document-or-throw/index.js";
import { toDocumentVersionResponse } from "../to-document-version-response/index.js";

export function toDocumentDetailResponse(document: DocumentWithVersions): DocumentDetailResponse {
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
