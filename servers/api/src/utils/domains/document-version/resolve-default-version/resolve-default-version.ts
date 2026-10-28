import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import { findLatestVersion } from "../find-latest-version/index.js";

/** 고정된 기본 버전이 있으면 그 버전, 없거나 지워졌으면 최신 버전 */
export function resolveDefaultVersion(
  versions: DocumentVersionEntity[],
  fixedVersionId: string | null,
): DocumentVersionEntity {
  return versions.find((version) => version.id === fixedVersionId) ?? findLatestVersion(versions);
}
