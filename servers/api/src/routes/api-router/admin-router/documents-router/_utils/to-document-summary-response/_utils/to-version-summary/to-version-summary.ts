import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";

export const toVersionSummary = (version: DocumentVersionEntity) => ({
  id: version.id,
  versionName: version.versionName,
});
