import type { DocumentVersionResponse } from "@fms/api-schemas/responses/document-responses";
import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";

export function toDocumentVersionResponse(
  version: DocumentVersionEntity,
  props: { latestVersionId: string; defaultVersionId: string },
): DocumentVersionResponse {
  return {
    id: version.id,
    seq: version.seq,
    versionName: version.versionName,
    fileName: version.fileName,
    fileSize: version.fileSize,
    mimeType: version.mimeType,
    isLatest: version.id === props.latestVersionId,
    isDefault: version.id === props.defaultVersionId,
    createdAt: version.createdAt.toISOString(),
    updatedAt: version.updatedAt.toISOString(),
  };
}
