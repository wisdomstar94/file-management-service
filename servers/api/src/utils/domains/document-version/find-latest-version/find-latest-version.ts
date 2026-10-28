import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";

/** 등록 순서(seq)가 가장 큰 버전 */
export function findLatestVersion(versions: DocumentVersionEntity[]): DocumentVersionEntity {
  return versions.reduce((latest, version) => (version.seq > latest.seq ? version : latest));
}
