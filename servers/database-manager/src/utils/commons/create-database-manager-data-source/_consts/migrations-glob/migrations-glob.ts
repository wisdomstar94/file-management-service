import { fileURLToPath } from "node:url";

export const MIGRATIONS_GLOB = fileURLToPath(new URL("../../../../../migrations/*.js", import.meta.url));
