import { createReadStream } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { STORAGE_ROOT_DIR } from "#/consts/storage-root-dir/index.js";

/**
 * `rootDir` 아래에 저장 키 경로 그대로 파일을 둔다. 도커에서는 이 경로를 볼륨으로 마운트한다.
 * S3 등으로 바꿀 때는 같은 메서드를 가진 클래스를 만들어 아래 `storageDriver` 만 바꾼다.
 */
class StorageDriver {
  constructor(private readonly rootDir: string) {}

  async saveFromTempFile(tempFilePath: string, key: string): Promise<void> {
    const target = this.resolveKey(key);
    await mkdir(path.dirname(target), { recursive: true });
    await rename(tempFilePath, target);
  }

  createReadStream(key: string): Readable {
    return createReadStream(this.resolveKey(key));
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolveKey(key), { force: true });
  }

  private resolveKey(key: string): string {
    const resolved = path.resolve(this.rootDir, key);
    if (!resolved.startsWith(path.resolve(this.rootDir) + path.sep)) {
      throw new Error(`저장소 밖을 가리키는 키입니다: ${key}`);
    }
    return resolved;
  }
}

export const storageDriver = new StorageDriver(STORAGE_ROOT_DIR);
