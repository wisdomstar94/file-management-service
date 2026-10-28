import type { DOCUMENT_LIST_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import { findLatestVersion } from "#/utils/resolve-default-version/index.js";
import type { DocumentWithVersions } from "../../_services/find-document-or-throw/index.js";

const toSummary = (version: DocumentVersionEntity) => ({ id: version.id, versionName: version.versionName });

export function toDocumentSummaryResponse(
  document: DocumentWithVersions,
): ResBody<typeof DOCUMENT_LIST_API>["data"]["items"][number] {
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
