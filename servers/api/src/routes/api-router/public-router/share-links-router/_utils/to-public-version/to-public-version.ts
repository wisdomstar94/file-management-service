import type { PUBLIC_SHARE_LINK_DETAIL_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import type { ResBody } from "@fms/api-schemas/types/api-schema-utils";
import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";

export const toPublicVersion = (
  version: DocumentVersionEntity,
): ResBody<typeof PUBLIC_SHARE_LINK_DETAIL_API>["data"]["defaultVersion"] => ({
  id: version.id,
  versionName: version.versionName,
  fileName: version.fileName,
  fileSize: version.fileSize,
});
