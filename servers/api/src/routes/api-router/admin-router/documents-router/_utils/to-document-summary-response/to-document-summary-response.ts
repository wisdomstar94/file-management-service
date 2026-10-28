import type { DOCUMENT_LIST_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import { findLatestVersion } from "#/utils/domains/document-version/find-latest-version/index.js";
import type { DocumentWithVersions } from "../../_services/find-document-or-throw/index.js";
import { toVersionSummary } from "./_utils/to-version-summary/index.js";

export function toDocumentSummaryResponse(
  document: DocumentWithVersions,
): ResBody<typeof DOCUMENT_LIST_API>["data"]["items"][number] {
  const latest = findLatestVersion(document.versions);
  const fixed = document.versions.find((version) => version.id === document.defaultVersionId);
  return {
    id: document.id,
    name: document.name,
    versionCount: document.versions.length,
    latestVersion: toVersionSummary(latest),
    latestVersionFileName: latest.fileName,
    fixedDefaultVersion: fixed ? toVersionSummary(fixed) : null,
    createdAt: document.createdAt.toISOString(),
    latestVersionCreatedAt: latest.createdAt.toISOString(),
  };
}
