import { createReadStream } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import type { StorageDriver } from "../../storage-driver.js";

/** `rootDir` 아래에 저장 키 경로 그대로 파일을 둔다. 도커에서는 이 경로를 볼륨으로 마운트한다. */
export function createLocalStorageDriver(rootDir: string): StorageDriver {
  const resolveKey = (key: string) => {
    const resolved = path.resolve(rootDir, key);
    if (!resolved.startsWith(path.resolve(rootDir) + path.sep)) {
      throw new Error(`저장소 밖을 가리키는 키입니다: ${key}`);
    }
    return resolved;
  };

  return {
    async saveFromTempFile(tempFilePath, key) {
      const target = resolveKey(key);
      await mkdir(path.dirname(target), { recursive: true });
      await rename(tempFilePath, target);
    },
    createReadStream(key) {
      return createReadStream(resolveKey(key));
    },
    async delete(key) {
      await rm(resolveKey(key), { force: true });
    },
  };
}
