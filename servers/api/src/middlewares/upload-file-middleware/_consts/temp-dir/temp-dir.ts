import path from "node:path";
import { STORAGE_ROOT_DIR } from "#/consts/storage-root-dir/index.js";

export const TEMP_DIR = path.join(STORAGE_ROOT_DIR, ".tmp");
