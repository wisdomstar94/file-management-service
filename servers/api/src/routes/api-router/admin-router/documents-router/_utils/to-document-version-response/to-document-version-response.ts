import type { DOCUMENT_DETAIL_API } from "@fms/api-schemas/schemas/document-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";

export function toDocumentVersionResponse(
  version: DocumentVersionEntity,
  props: { latestVersionId: string; defaultVersionId: string },
): ResBody<typeof DOCUMENT_DETAIL_API>["data"]["versions"][number] {
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
