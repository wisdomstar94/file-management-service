import { execFileSync } from "node:child_process";
import { PACKAGE_DIR, TYPEORM_CLI } from "./_consts/database-manager-paths";

/** 빌드된 database-manager 를 실제 CLI 와 같은 방식으로 실행한다. */
export function runDatabaseManagerCommand(
  command: "migration:run" | "migration:revert" | "seed",
  databaseName: string,
) {
  const env = { ...process.env, DB_NAME: databaseName };
  const args =
    command === "seed"
      ? ["./dist/scripts/run-seed/run-seed.js"]
      : [TYPEORM_CLI, "-d", "./dist/data-source/data-source.js", command];

  return execFileSync("node", args, { cwd: PACKAGE_DIR, env, encoding: "utf-8" });
}
