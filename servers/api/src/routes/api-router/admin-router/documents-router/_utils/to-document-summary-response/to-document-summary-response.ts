import type { DocumentSummaryResponse } from "@fms/api-schemas/responses/document-responses";
import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import { findLatestVersion } from "../../../../../../utils/resolve-default-version/index.js";
import type { DocumentWithVersions } from "../../_services/find-document-or-throw/index.js";

const toSummary = (version: DocumentVersionEntity) => ({ id: version.id, versionName: version.versionName });

export function toDocumentSummaryResponse(document: DocumentWithVersions): DocumentSummaryResponse {
  const latest = findLatestVersion(document.versions);
  const fixed = document.versions.find((version) => version.id === document.defaultVersionId);
  return {
    id: document.id,
    name: document.name,
    versionCount: document.versions.length,
    latestVersion: toSummary(latest),
    latestVersionFileName: latest.fileName,
    fixedDefaultVersion: fixed ? toSummary(fixed) : null,
    createdAt: document.createdAt.toISOString(),
    latestVersionCreatedAt: latest.createdAt.toISOString(),
  };
}
