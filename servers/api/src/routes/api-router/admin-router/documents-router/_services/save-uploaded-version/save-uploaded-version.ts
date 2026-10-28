import { randomUUID } from "node:crypto";
import { DocumentVersionEntity } from "@fms/database-entities/entities/document-version-entity";
import type { EntityManager } from "typeorm";
import { storageDriver } from "#/singleton-classes/storage-driver/index.js";
import { createVersionStorageKey } from "#/utils/create-version-storage-key/index.js";

/**
 * 업로드된 임시 파일을 저장소로 옮기고 버전 행을 만든다. 등록 순서(seq)는 그 자료의 마지막 값 + 1.
 * 트랜잭션 안에서 부르며, DB 저장이 실패하면 옮긴 파일을 지운다.
 */
export async function saveUploadedVersion(
  manager: EntityManager,
  props: { documentId: string; versionName: string; file: Express.Multer.File },
): Promise<DocumentVersionEntity> {
  const repository = manager.getRepository(DocumentVersionEntity);
  const last = await repository.findOne({
    where: { documentId: props.documentId },
    order: { seq: "DESC" },
    lock: { mode: "pessimistic_write" },
  });

  const id = randomUUID();
  const storageKey = createVersionStorageKey(props.documentId, id);
  await storageDriver.saveFromTempFile(props.file.path, storageKey);
  try {
    return await repository.save(
      repository.create({
        id,
        documentId: props.documentId,
        seq: (last?.seq ?? 0) + 1,
        versionName: props.versionName,
        fileName: props.file.originalname,
        fileSize: props.file.size,
        mimeType: props.file.mimetype,
        storageKey,
      }),
    );
  } catch (err) {
    await storageDriver.delete(storageKey);
    throw err;
  }
}
