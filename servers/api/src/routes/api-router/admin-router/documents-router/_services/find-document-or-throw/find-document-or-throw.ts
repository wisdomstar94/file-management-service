import { DocumentEntity } from "@fms/database-entities/entities/document-entity";
import type { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import type { EntityManager } from "typeorm";
import { notFoundError } from "../../../../../../utils/not-found-error/index.js";

export type DocumentWithVersions = DocumentEntity & { versions: DocumentVersionEntity[] };

/** 자료와 버전 전체(최신순)를 읽는다. 자료는 버전을 1개 이상 가진다. */
export async function findDocumentOrThrow(manager: EntityManager, id: string): Promise<DocumentWithVersions> {
  const document = await manager.getRepository(DocumentEntity).findOne({
    where: { id },
    relations: { versions: true },
    order: { versions: { seq: "DESC" } },
  });
  if (!document?.versions?.length) {
    throw notFoundError("자료");
  }
  return document as DocumentWithVersions;
}
