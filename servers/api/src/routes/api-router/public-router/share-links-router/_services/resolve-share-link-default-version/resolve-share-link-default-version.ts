import type { DocumentEntity } from "@fms/database-entities/entities/document-entity";
import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import type { ShareLinkEntity } from "@fms/database-entities/entities/share-link-entity";
import { resolveDefaultVersion } from "../../../../../../utils/resolve-default-version/index.js";

export function resolveShareLinkDefaultVersion(
  link: ShareLinkEntity,
  document: DocumentEntity,
  versions: DocumentVersionEntity[],
): DocumentVersionEntity {
  const fixed = link.defaultVersionMode === "FIXED" ? versions.find((v) => v.id === link.fixedVersionId) : undefined;
  return fixed ?? resolveDefaultVersion(versions, document.defaultVersionId);
}
