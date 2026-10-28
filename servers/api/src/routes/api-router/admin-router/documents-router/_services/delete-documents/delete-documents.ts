import { DocumentEntity } from "@fms/database-entities/entities/document-entity";
import { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import { In } from "typeorm";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";
import { storageDriver } from "#/singleton-classes/storage-driver/index.js";

/** 자료를 지우면 버전 · 공개 링크는 DB 에서 함께 지워지고(cascade), 파일은 커밋 후 지운다. */
export async function deleteDocuments(ids: string[]): Promise<number> {
  const storageKeys = await appDataSource.transaction(async (manager) => {
    const versions = await manager.getRepository(DocumentVersionEntity).findBy({ documentId: In(ids) });
    await manager.getRepository(DocumentEntity).update({ id: In(ids) }, { defaultVersionId: null });
    const result = await manager.getRepository(DocumentEntity).delete({ id: In(ids) });
    return { keys: versions.map((version) => version.storageKey), affected: result.affected ?? 0 };
  });

  await Promise.all(storageKeys.keys.map((key) => storageDriver.delete(key)));
  return storageKeys.affected;
}
