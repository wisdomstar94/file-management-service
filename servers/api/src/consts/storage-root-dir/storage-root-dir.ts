import path from "node:path";
import { apiEnv } from "#/consts/api-env/index.js";

export const STORAGE_ROOT_DIR = path.resolve(apiEnv.storageDir);
