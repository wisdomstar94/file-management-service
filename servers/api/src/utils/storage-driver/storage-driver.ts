import path from "node:path";
import type { Readable } from "node:stream";
import { apiEnv } from "../api-env/index.js";
import { createLocalStorageDriver } from "./_utils/create-local-storage-driver/index.js";

/** 파일 저장소 추상화. S3 등으로 바꿀 때는 이 인터페이스의 구현만 추가한다. */
export type StorageDriver = {
  saveFromTempFile: (tempFilePath: string, key: string) => Promise<void>;
  createReadStream: (key: string) => Readable;
  delete: (key: string) => Promise<void>;
};

export const STORAGE_ROOT_DIR = path.resolve(apiEnv.storageDir);

export const storageDriver: StorageDriver = createLocalStorageDriver(STORAGE_ROOT_DIR);

export function createVersionStorageKey(documentId: string, versionId: string): string {
  return `documents/${documentId}/${versionId}`;
}
