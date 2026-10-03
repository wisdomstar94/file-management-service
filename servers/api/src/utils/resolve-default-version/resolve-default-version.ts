import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";

/** 등록 순서(seq)가 가장 큰 버전 */
export function findLatestVersion(versions: DocumentVersionEntity[]): DocumentVersionEntity {
  return versions.reduce((latest, version) => (version.seq > latest.seq ? version : latest));
}

/** 고정된 기본 버전이 있으면 그 버전, 없거나 지워졌으면 최신 버전 */
export function resolveDefaultVersion(
  versions: DocumentVersionEntity[],
  fixedVersionId: string | null,
): DocumentVersionEntity {
  return versions.find((version) => version.id === fixedVersionId) ?? findLatestVersion(versions);
}
